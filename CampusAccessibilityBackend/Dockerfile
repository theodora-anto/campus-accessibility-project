# ============================================================
# Stage 1: build — χρησιμοποιούμε SDK για compile
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY CampusAccessibilityBackend/*.csproj CampusAccessibilityBackend/
RUN dotnet restore CampusAccessibilityBackend/CampusAccessibilityBackend.csproj

COPY CampusAccessibilityBackend/ CampusAccessibilityBackend/

WORKDIR /src/CampusAccessibilityBackend
RUN dotnet publish -c Release -o /app

# ============================================================
# Stage 2: RUN — μόνο runtime, χωρίς SDK, χωρίς source code
# Αυτό είναι το τελικό image
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app .

ENTRYPOINT ["dotnet", "CampusAccessibilityBackend.dll"]
