package com.placeprep.dto;

import com.fasterxml.jackson.annotation.JsonAnyGetter;

import java.util.Map;

/**
 * JSON-safe representation of a persisted entity.
 *
 * <p>The DTO keeps the response shape backward compatible while preventing
 * controllers from serializing JPA entities directly.</p>
 */
public final class EntityResponseDto {

    private final Map<String, Object> fields;

    public EntityResponseDto(Map<String, Object> fields) {
        this.fields = fields;
    }

    @JsonAnyGetter
    public Map<String, Object> getFields() {
        return fields;
    }
}
