package com.placeprep.service;

import com.placeprep.dto.selection.AdvanceRoundRequest;
import com.placeprep.dto.selection.AdvanceRoundResponse;
import com.placeprep.dto.selection.DriveRoundDefinitionDto;
import com.placeprep.dto.selection.FinalizeOffersRequest;
import com.placeprep.dto.selection.FinalizeOffersResponse;
import com.placeprep.dto.selection.OfferIssueDto;
import com.placeprep.dto.selection.RoundCandidateResponse;
import com.placeprep.exception.BadRequestException;
import com.placeprep.exception.ResourceNotFoundException;
import com.placeprep.mapper.SelectionMapper;
import com.placeprep.model.CandidateEvaluation;
import com.placeprep.model.DriveRound;
import com.placeprep.model.PlacementDrive;
import com.placeprep.model.SelectionResult;
import com.placeprep.model.StudentApplication;
import com.placeprep.repository.DriveRoundRepository;
import com.placeprep.repository.SelectionResultRepository;
import com.placeprep.repository.StudentApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SelectionWorkflowService {

    public static final String PIPELINE_IN = "IN_PIPELINE";
    public static final String PIPELINE_REJECTED = "REJECTED";
    public static final String PIPELINE_OFFERED = "OFFERED";

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    @Autowired
    private DriveRoundRepository driveRoundRepository;

    @Autowired
    private SelectionResultRepository selectionResultRepository;

    @Autowired
    private StudentApplicationRepository applicationRepository;

    @Autowired
    private DriveService driveService;

    @Autowired
    private EvaluationService evaluationService;

    @Transactional
    public List<DriveRound> defineDriveRounds(String driveId, List<DriveRoundDefinitionDto> roundDefs) {
        PlacementDrive drive = requireDrive(driveId);

        driveRoundRepository.deleteByDriveId(driveId);

        List<String> roundNames = new ArrayList<>();
        List<DriveRound> saved = new ArrayList<>();

        for (DriveRoundDefinitionDto def : roundDefs) {
            DriveRound round = SelectionMapper.toEntity(driveId, def);
            saved.add(driveRoundRepository.save(round));
            roundNames.add("Round " + round.getRoundNumber() + ": " + round.getName());
        }

        drive.setRounds(roundNames);
        driveService.create(drive);

        return saved;
    }

    public List<DriveRound> getDriveRounds(String driveId) {
        return driveRoundRepository.findByDriveIdOrderByRoundNumberAsc(driveId);
    }

    public List<RoundCandidateResponse> getCandidatesInRound(String driveId, int roundNumber) {
        List<SelectionResult> inRound = selectionResultRepository.findByDriveIdAndCurrentRoundNumberAndPipelineStatus(
                driveId,
                roundNumber,
                PIPELINE_IN
        );

        List<RoundCandidateResponse> result = new ArrayList<>();
        for (SelectionResult sr : inRound) {
            Optional<StudentApplication> appOpt = applicationRepository.findByApplicationId(sr.getApplicationId());
            if (!appOpt.isPresent()) {
                continue;
            }
            StudentApplication app = appOpt.get();
            CandidateEvaluation latest = evaluationService.getLatestEvaluation(
                    app.getApplicationId(),
                    roundNumber
            ).orElse(null);
            result.add(RoundCandidateResponse.of(app, sr, latest));
        }
        return result;
    }

    @Transactional
    public AdvanceRoundResponse advanceRound(String driveId, int roundNumber, AdvanceRoundRequest options) {
        requireDrive(driveId);

        List<DriveRound> rounds = driveRoundRepository.findByDriveIdOrderByRoundNumberAsc(driveId);
        if (rounds.isEmpty()) {
            throw new BadRequestException("No rounds configured for drive. POST rounds first.");
        }

        DriveRound currentRound = findRound(rounds, roundNumber);
        if (currentRound == null) {
            throw new ResourceNotFoundException("Round not found: " + roundNumber);
        }

        double cutoff = options != null && options.getCutoffScore() != null
                ? options.getCutoffScore()
                : (currentRound.getCutoffScore() != null ? currentRound.getCutoffScore() : 6.0);

        boolean useVerdict = options == null || !Boolean.FALSE.equals(options.getUseVerdict());
        String defaultRejectionFeedback = options != null && options.getRejectionFeedback() != null
                ? options.getRejectionFeedback()
                : "Did not meet the cutoff for " + currentRound.getName();

        List<SelectionResult> candidates = selectionResultRepository.findByDriveIdAndCurrentRoundNumberAndPipelineStatus(
                driveId,
                roundNumber,
                PIPELINE_IN
        );

        int maxRound = rounds.get(rounds.size() - 1).getRoundNumber();
        List<String> advanced = new ArrayList<>();
        List<String> rejected = new ArrayList<>();
        List<String> held = new ArrayList<>();

        for (SelectionResult sr : candidates) {
            Optional<CandidateEvaluation> evalOpt =
                    evaluationService.getLatestEvaluation(sr.getApplicationId(), roundNumber);

            Decision decision = decide(evalOpt.orElse(null), cutoff, useVerdict);

            if (decision == Decision.HOLD) {
                held.add(sr.getApplicationId());
                continue;
            }
            if (decision == Decision.REJECT) {
                rejectCandidate(sr, roundNumber, evalOpt.map(CandidateEvaluation::getComments)
                        .orElse(defaultRejectionFeedback));
                rejected.add(sr.getApplicationId());
                continue;
            }

            if (roundNumber >= maxRound) {
                sr.setPipelineStatus(PIPELINE_IN);
                sr.setLastUpdatedAt(now());
                appendHistory(sr, "Completed final round " + roundNumber + " — awaiting offer finalization");
                selectionResultRepository.save(sr);
                updateApplicationRound(sr.getApplicationId(), currentRound.getName(), "FINAL_ROUND");
                advanced.add(sr.getApplicationId());
            } else {
                int nextRoundNum = roundNumber + 1;
                DriveRound nextRound = findRound(rounds, nextRoundNum);
                sr.setCurrentRoundNumber(nextRoundNum);
                sr.setLastUpdatedAt(now());
                appendHistory(sr, "Advanced from round " + roundNumber + " to " + nextRoundNum);
                selectionResultRepository.save(sr);
                String roundLabel = nextRound != null ? nextRound.getName() : ("Round " + nextRoundNum);
                updateApplicationRound(sr.getApplicationId(), roundLabel, "SHORTLISTED");
                advanced.add(sr.getApplicationId());
            }
        }

        return AdvanceRoundResponse.builder()
                .driveId(driveId)
                .roundNumber(roundNumber)
                .cutoffUsed(cutoff)
                .advancedCount(advanced.size())
                .rejectedCount(rejected.size())
                .heldCount(held.size())
                .advancedApplicationIds(advanced)
                .rejectedApplicationIds(rejected)
                .heldApplicationIds(held)
                .notifications(buildNotifications(rejected, defaultRejectionFeedback))
                .build();
    }

    @Transactional
    public FinalizeOffersResponse finalizeOffers(String driveId, FinalizeOffersRequest payload) {
        PlacementDrive drive = requireDrive(driveId);

        String defaultCtc = payload != null && payload.getDefaultCtc() != null
                ? payload.getDefaultCtc()
                : drive.getCtc();
        String defaultJoining = payload != null ? payload.getDefaultJoiningDate() : null;
        String defaultDetails = payload != null && payload.getDefaultOfferDetails() != null
                ? payload.getDefaultOfferDetails()
                : "Congratulations! Please confirm acceptance with the TPO.";

        List<OfferIssueDto> explicitOffers = payload != null ? payload.getOffers() : null;

        List<Map<String, Object>> issued = new ArrayList<>();

        if (explicitOffers != null && !explicitOffers.isEmpty()) {
            for (OfferIssueDto offer : explicitOffers) {
                issued.add(issueOffer(offer.getApplicationId(), offer, defaultCtc, defaultJoining, defaultDetails));
            }
        } else {
            List<DriveRound> rounds = driveRoundRepository.findByDriveIdOrderByRoundNumberAsc(driveId);
            int finalRound = rounds.isEmpty() ? 1 : rounds.get(rounds.size() - 1).getRoundNumber();
            List<SelectionResult> finalists = selectionResultRepository.findByDriveIdAndCurrentRoundNumberAndPipelineStatus(
                    driveId,
                    finalRound,
                    PIPELINE_IN
            );
            for (SelectionResult sr : finalists) {
                OfferIssueDto offer = new OfferIssueDto();
                offer.setApplicationId(sr.getApplicationId());
                issued.add(issueOffer(sr.getApplicationId(), offer, defaultCtc, defaultJoining, defaultDetails));
            }
        }

        return FinalizeOffersResponse.builder()
                .driveId(driveId)
                .offersIssued(issued.size())
                .offers(issued)
                .build();
    }

    private PlacementDrive requireDrive(String driveId) {
        PlacementDrive drive = driveService.getByDriveId(driveId);
        if (drive == null) {
            throw new ResourceNotFoundException("Placement Drive not found: " + driveId);
        }
        return drive;
    }

    public SelectionResult initializePipeline(StudentApplication app) {
        Optional<SelectionResult> existing = selectionResultRepository.findByApplicationId(app.getApplicationId());
        if (existing.isPresent()) {
            return existing.get();
        }

        SelectionResult sr = new SelectionResult();
        sr.setApplicationId(app.getApplicationId());
        sr.setDriveId(app.getDriveId());
        sr.setStudentId(app.getStudentId());
        sr.setCurrentRoundNumber(1);
        sr.setPipelineStatus(PIPELINE_IN);
        sr.setLastUpdatedAt(now());
        sr.setPromotionHistoryJson("[{\"event\":\"ENTERED_PIPELINE\",\"round\":1,\"at\":\"" + now() + "\"}]");

        List<DriveRound> rounds = driveRoundRepository.findByDriveIdOrderByRoundNumberAsc(app.getDriveId());
        if (!rounds.isEmpty()) {
            DriveRound first = rounds.get(0);
            app.setCurrentRound("Round " + first.getRoundNumber() + ": " + first.getName());
        } else {
            app.setCurrentRound("Round 1: Screening");
        }
        app.setStatus("IN_PIPELINE");
        applicationRepository.save(app);

        return selectionResultRepository.save(sr);
    }

    private Map<String, Object> issueOffer(
            String applicationId,
            OfferIssueDto offer,
            String defaultCtc,
            String defaultJoining,
            String defaultDetails
    ) {
        Optional<SelectionResult> srOpt = selectionResultRepository.findByApplicationId(applicationId);
        if (!srOpt.isPresent()) {
            throw new IllegalArgumentException("No pipeline record for application: " + applicationId);
        }
        SelectionResult sr = srOpt.get();
        if (PIPELINE_REJECTED.equals(sr.getPipelineStatus())) {
            throw new IllegalArgumentException("Cannot offer rejected candidate: " + applicationId);
        }

        String ctc = offer != null && offer.getCtc() != null ? offer.getCtc() : defaultCtc;
        String joining = offer != null && offer.getJoiningDate() != null ? offer.getJoiningDate() : defaultJoining;
        String details = offer != null && offer.getOfferDetails() != null ? offer.getOfferDetails() : defaultDetails;

        sr.setPipelineStatus(PIPELINE_OFFERED);
        sr.setOfferCtc(ctc);
        sr.setJoiningDate(joining);
        sr.setOfferDetails(details);
        sr.setLastUpdatedAt(now());
        appendHistory(sr, "OFFER_EXTENDED");
        selectionResultRepository.save(sr);

        Optional<StudentApplication> appOpt = applicationRepository.findByApplicationId(applicationId);
        appOpt.ifPresent(app -> {
            app.setStatus("OFFERED");
            app.setCurrentRound("Offer Extended");
            applicationRepository.save(app);
        });

        Map<String, Object> row = new HashMap<>();
        row.put("applicationId", applicationId);
        row.put("ctc", ctc);
        row.put("joiningDate", joining);
        row.put("offerDetails", details);
        return row;
    }

    private void rejectCandidate(SelectionResult sr, int roundNumber, String feedback) {
        sr.setPipelineStatus(PIPELINE_REJECTED);
        sr.setRejectedAtRound(roundNumber);
        sr.setRejectionFeedback(feedback);
        sr.setLastUpdatedAt(now());
        appendHistory(sr, "REJECTED at round " + roundNumber);
        selectionResultRepository.save(sr);

        applicationRepository.findByApplicationId(sr.getApplicationId()).ifPresent(app -> {
            app.setStatus("REJECTED");
            app.setCurrentRound("Eliminated — Round " + roundNumber);
            applicationRepository.save(app);
        });
    }

    private void updateApplicationRound(String applicationId, String roundName, String status) {
        applicationRepository.findByApplicationId(applicationId).ifPresent(app -> {
            app.setCurrentRound(roundName);
            app.setStatus(status);
            applicationRepository.save(app);
        });
    }

    private enum Decision { ADVANCE, REJECT, HOLD }

    private Decision decide(CandidateEvaluation eval, double cutoff, boolean useVerdict) {
        if (eval == null) {
            return Decision.HOLD;
        }
        if (useVerdict && eval.getVerdict() != null) {
            switch (eval.getVerdict()) {
                case "REJECT":
                    return Decision.REJECT;
                case "HOLD":
                    return Decision.HOLD;
                case "ADVANCE":
                    return Decision.ADVANCE;
                default:
                    break;
            }
        }
        if (eval.compositeScore() >= cutoff) {
            return Decision.ADVANCE;
        }
        return Decision.REJECT;
    }

    private DriveRound findRound(List<DriveRound> rounds, int roundNumber) {
        for (DriveRound r : rounds) {
            if (r.getRoundNumber() != null && r.getRoundNumber() == roundNumber) {
                return r;
            }
        }
        return null;
    }

    private List<Map<String, String>> buildNotifications(List<String> rejectedIds, String feedback) {
        List<Map<String, String>> notes = new ArrayList<>();
        for (String id : rejectedIds) {
            applicationRepository.findByApplicationId(id).ifPresent(app -> {
                Map<String, String> n = new HashMap<>();
                n.put("studentEmail", app.getStudentEmail());
                n.put("applicationId", id);
                n.put("message", "Your application for " + app.getCompanyName() + " has been marked REJECTED. "
                        + feedback);
                notes.add(n);
            });
        }
        return notes;
    }

    private void appendHistory(SelectionResult sr, String event) {
        String history = sr.getPromotionHistoryJson();
        String entry = "{\"event\":\"" + event.replace("\"", "'") + "\",\"at\":\"" + now() + "\"}";
        if (history == null || history.trim().isEmpty()) {
            sr.setPromotionHistoryJson("[" + entry + "]");
        } else {
            sr.setPromotionHistoryJson(history.substring(0, history.length() - 1) + "," + entry + "]");
        }
    }

    private String now() {
        return LocalDateTime.now().format(TS);
    }

    private int toInt(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(value.toString());
    }

    private double toDouble(Object value) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return Double.parseDouble(value.toString());
    }
}
