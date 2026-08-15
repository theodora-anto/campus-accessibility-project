-- Idempotent init script: δημιουργεί τη βάση, το login και τον user
-- μόνο αν δεν υπάρχουν ήδη. Τρέχει μέσω sqlcmd -v DbName=... DbUser=... DbUserPassword=...

IF DB_ID(N'$(DbName)') IS NULL
BEGIN
    PRINT 'Δημιουργία βάσης $(DbName)...';
    CREATE DATABASE [$(DbName)];
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'$(DbUser)')
BEGIN
    PRINT 'Δημιουργία login $(DbUser)...';
    CREATE LOGIN [$(DbUser)] WITH PASSWORD = N'$(DbUserPassword)';
END
GO

USE [$(DbName)];
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'$(DbUser)')
BEGIN
    PRINT 'Δημιουργία user $(DbUser) μέσα στη βάση $(DbName)...';
    CREATE USER [$(DbUser)] FOR LOGIN [$(DbUser)];
    ALTER ROLE db_owner ADD MEMBER [$(DbUser)];
END
GO
