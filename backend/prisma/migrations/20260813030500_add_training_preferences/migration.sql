ALTER TABLE `Profile`
  ADD COLUMN `trainingGoal` VARCHAR(191) NULL,
  ADD COLUMN `fitnessLevel` VARCHAR(191) NULL,
  ADD COLUMN `sessionsPerWeek` INT NULL,
  ADD COLUMN `preferredDuration` INT NULL;
