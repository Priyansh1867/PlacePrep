package com.placeprep.mapper;

import com.placeprep.dto.EntityResponseDto;
import org.hibernate.Hibernate;
import org.hibernate.collection.spi.PersistentCollection;

import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public final class EntityResponseMapper {

    private EntityResponseMapper() {
    }

    public static EntityResponseDto toDto(Object entity) {
        if (entity == null) {
            return null;
        }
        if (entity instanceof EntityResponseDto dto) {
            return dto;
        }

        Map<String, Object> fields = toBeanMap(entity);
        fields.remove("password");
        fields.remove("resetPasswordToken");
        fields.remove("resetPasswordExpiry");
        fields.remove("resetToken");
        fields.remove("resetTokenExpiry");
        fields.remove("hibernateLazyInitializer");
        fields.remove("handler");
        return new EntityResponseDto(fields);
    }

    private static Map<String, Object> toBeanMap(Object bean) {
        Map<String, Object> fields = new LinkedHashMap<>();
        try {
            for (PropertyDescriptor property : Introspector.getBeanInfo(bean.getClass(), Object.class)
                    .getPropertyDescriptors()) {
                if (property.getReadMethod() == null || isSensitive(property.getName())) {
                    continue;
                }

                Object value = property.getReadMethod().invoke(bean);
                if (value instanceof PersistentCollection persistentCollection
                        && !Hibernate.isInitialized(persistentCollection)) {
                    fields.put(property.getName(), List.of());
                } else {
                    fields.put(property.getName(), toJsonSafe(value));
                }
            }
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Could not map " + bean.getClass().getName() + " to a response DTO", e);
        } catch (java.beans.IntrospectionException e) {
            throw new IllegalStateException("Could not inspect " + bean.getClass().getName()
                    + " for response mapping", e);
        }
        return fields;
    }

    private static boolean isSensitive(String propertyName) {
        return propertyName.equals("password")
                || propertyName.equals("resetPasswordToken")
                || propertyName.equals("resetPasswordExpiry")
                || propertyName.equals("resetToken")
                || propertyName.equals("resetTokenExpiry")
                || propertyName.equals("hibernateLazyInitializer")
                || propertyName.equals("handler");
    }

    public static List<EntityResponseDto> toDtoList(Collection<?> entities) {
        return entities.stream().map(EntityResponseMapper::toDto).toList();
    }

    public static Optional<EntityResponseDto> toDtoOptional(Optional<?> entity) {
        return entity.map(EntityResponseMapper::toDto);
    }

    /**
     * Recursively removes entities from arbitrary tool/report payloads.
     * This is used for responses whose shape is intentionally map-based.
     */
    public static Object toJsonSafe(Object value) {
        if (value == null || value instanceof String || value instanceof Number
                || value instanceof Boolean || value instanceof Character
                || value instanceof Enum<?> || value instanceof UUID
                || value instanceof java.time.temporal.TemporalAccessor
                || value instanceof java.util.Date) {
            return value;
        }
        if (value instanceof EntityResponseDto dto) {
            return toJsonSafe(dto.getFields());
        }
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> safe = new LinkedHashMap<>();
            map.forEach((key, item) -> safe.put(String.valueOf(key), toJsonSafe(item)));
            return safe;
        }
        if (value instanceof Collection<?> collection) {
            return collection.stream().map(EntityResponseMapper::toJsonSafe).toList();
        }
        return toDto(value).getFields();
    }
}
