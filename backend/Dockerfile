FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

# 🔥 FIX: give execute permission to mvnw
RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests

EXPOSE 9090

CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
