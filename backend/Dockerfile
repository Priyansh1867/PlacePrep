# Stage 1: Build with Maven and JDK 23
FROM maven:3.9.9-eclipse-temurin-23 AS build
WORKDIR /app

# Copy pom.xml and source code directly
COPY pom.xml .
COPY src ./src

# Package production jar (skipping unit tests for fast cloud build)
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime with Java 23
FROM eclipse-temurin:23-jre
WORKDIR /app

# Copy executable jar from build stage
COPY --from=build /app/target/app.jar app.jar

ENV PORT=8082
EXPOSE 8082

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
