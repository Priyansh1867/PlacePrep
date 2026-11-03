# Multi-stage build for PlacePrep Backend from repo root with Java 23
FROM maven:3.9.9-eclipse-temurin-23 AS build
WORKDIR /app

# Copy pom.xml and backend source code
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build production jar skipping tests
RUN mvn clean package -DskipTests -B

# Runtime stage with Java 23
FROM eclipse-temurin:23-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV PORT=8082
EXPOSE 8082

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
