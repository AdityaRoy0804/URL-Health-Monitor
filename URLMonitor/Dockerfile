FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/URLMonitor-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 1204

ENTRYPOINT ["java", "-jar", "app.jar"]