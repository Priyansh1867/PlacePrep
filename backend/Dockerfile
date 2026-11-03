# Stage 1: Build with Maven and JDK 21 LTS
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Build application jar (skipping unit tests for fast build)
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Lightweight JRE 21 runtime
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render sets PORT dynamically (defaults to 8082 if not provided)
ENV PORT=8082
EXPOSE 8082

# Optimized for cloud containers (respects 512MB RAM limits)
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
