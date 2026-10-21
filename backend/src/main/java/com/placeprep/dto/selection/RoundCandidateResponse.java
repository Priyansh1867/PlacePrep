package com.placeprep.dto.selection;

import com.placeprep.dto.application.StudentApplicationSummaryDto;
import com.placeprep.model.CandidateEvaluation;
import com.placeprep.model.SelectionResult;
import com.placeprep.model.StudentApplication;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoundCandidateResponse {

    private StudentApplicationSummaryDto application;
    private SelectionPipelineDto pipeline;
    private CandidateEvaluationResponse latestEvaluation;

    public static RoundCandidateResponse of(
            StudentApplication app,
            SelectionResult pipeline,
            CandidateEvaluation evaluation
    ) {
        RoundCandidateResponseBuilder builder = RoundCandidateResponse.builder()
                .application(StudentApplicationSummaryDto.from(app))
                .pipeline(SelectionPipelineDto.from(pipeline));
        if (evaluation != null) {
            builder.latestEvaluation(CandidateEvaluationResponse.from(evaluation));
        }
        return builder.build();
    }
}
