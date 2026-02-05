FROM eclipse-temurin:17-jdk AS build
WORKDIR /workspace

COPY Backend/gradlew Backend/gradlew
COPY Backend/gradle Backend/gradle
COPY Backend/build.gradle Backend/build.gradle

RUN chmod +x Backend/gradlew

COPY Backend/src Backend/src

RUN cd Backend && ./gradlew build -x test

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /workspace/Backend/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
