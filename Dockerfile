#Use an official Maven image to build the Spring Boot app
FROM maven:3.8.4-openjdk-17 AS build

#Set the working directory
WORKDIR /app

#Copy the pom.xml and install dependencies
COPY pom.xml .
RUN mvn dependency:resolve

#Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

#Use an official OpenJDK image to run the application
FROM openjdk:17-jdk-slim

#Set the working directory
WORKDIR /app

#Copy the build jar file from the build stage
COPY --from=build /app/target/coin-flip-casino-0.0.1-SNAPSHOT.jar .

#Expose port 8080
EXPOSE 8080

#Specify the command to run the application
ENTRYPOINT ["java", "-jar", "/app/coin-flip-casino-0.0.1-SNAPSHOT.jar"]
