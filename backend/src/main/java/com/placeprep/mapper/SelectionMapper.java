package com.placeprep.mapper;

import com.placeprep.dto.selection.CandidateEvaluationRequest;
import com.placeprep.dto.selection.DriveRoundDefinitionDto;
import com.placeprep.model.CandidateEvaluation;
import com.placeprep.model.DriveRound;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class SelectionMapper {

    private SelectionMapper() {
    }

    public static List<Map<String, Object>> toRoundDefMaps(List<DriveRoundDefinitionDto> rounds) {
        return rounds.stream().map(dto -> {
            Map<String, Object> map = new HashMap<>();
            map.put("roundNumber", dto.getRoundNumber());
            map.put("name", dto.getName());
            map.put("type", dto.getType());
            map.put("cutoffScore", dto.getCutoffScore());
            return map;
        }).collect(Collectors.toList());
    }

    public static CandidateEvaluation toEntity(CandidateEvaluationRequest request) {
        CandidateEvaluation evaluation = new CandidateEvaluation();
        evaluation.setApplicationId(request.getApplicationId());
        evaluation.setDriveId(request.getDriveId());
        evaluation.setRoundNumber(request.getRoundNumber());
        evaluation.setEvaluatorId(request.getEvaluatorId());
        evaluation.setEvaluatorName(request.getEvaluatorName());
        evaluation.setTechnicalScore(request.getTechnicalScore());
        evaluation.setProblemSolvingScore(request.getProblemSolvingScore());
        evaluation.setCommunicationScore(request.getCommunicationScore());
        evaluation.setComments(request.getComments());
        evaluation.setVerdict(request.getVerdict());
        return evaluation;
    }

    public static DriveRound toEntity(String driveId, DriveRoundDefinitionDto dto) {
        DriveRound round = new DriveRound();
        round.setDriveId(driveId);
        round.setRoundNumber(dto.getRoundNumber());
        round.setName(dto.getName());
        round.setType(dto.getType() != null ? dto.getType() : "OTHER");
        round.setCutoffScore(dto.getCutoffScore());
        return round;
    }
}
