-- depenses_laboratoire
DROP PROCEDURE IF EXISTS IMPORT_DEPENSES_LABO;
DELIMITER ;;

CREATE PROCEDURE IMPORT_DEPENSES_LABO()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
SELECT COUNT(*) FROM old.depenses_labo INTO n;
SET i=0;
WHILE i<n DO 
  INSERT INTO `document`(`type`, `date`, `departement`, `operateur`, `patient`, `createdAt`, `updatedAt`)
    SELECT
      'BON',
      CONCAT(
        SUBSTRING_INDEX(`bon`.`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`bon`.`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`bon`.`datecom`, '/', 1)
      ),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      `agent`,
      NULL,
      now(),
      now()
    FROM old.depenses_labo as bon LIMIT i,1;
  INSERT INTO `ecriture`(`libele`, `montant`, `date`, `taux`, `devise`, `departement`, `document`, `createdAt`, `updatedAt`)
    SELECT
      `libacte`,
      `prix` * -1,
      CONCAT(
        SUBSTRING_INDEX(`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`datecom`, '/', 1)
      ),
      1,
      IF(`devise` IS NULL OR `devise`='', 'USD', `devise`),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.depenses_labo as bon LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;

-- caisse labo
DROP PROCEDURE IF EXISTS IMPORT_ENTREES_LABO;
DELIMITER ;;

CREATE PROCEDURE IMPORT_ENTREES_LABO()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
DECLARE medecin INT DEFAULT 0;
SELECT COUNT(*) FROM old.reception_labo INTO n;
SET i=0;
WHILE i<n DO
  INSERT INTO `patient`(`nom`, `postnom`, `prenom`, `sexe`, `createdAt`, `updatedAt`) SELECT `nom`, `prenom`, `postnom`, IF(`sexe` <> 'H' AND `sexe` <> 'F', 'H', `sexe`), now(), now() FROM old.reception_labo LIMIT i,1;
  INSERT INTO `document`(`type`, `date`, `departement`, `operateur`, `patient`, `gratuit`, `createdAt`, `updatedAt`)
    SELECT
      'FACTURE',
      CONCAT(
        SUBSTRING_INDEX(`facture`.`dates`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`facture`.`dates`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`facture`.`dates`, '/', 1)
      ),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      IF(`compte` IS NULL OR `compte`='', 'admin', `compte`),
      (SELECT LAST_INSERT_ID()),
      IF(`montant` = 0, true, false),
      now(),
      now()
    FROM old.reception_labo as facture LIMIT i,1;
  INSERT INTO `ecriture`(`libele`, `montant`, `date`, `taux`, `devise`, `departement`, `document`, `createdAt`, `updatedAt`)
    SELECT
      `examens`,
      `montant`,
      CONCAT(
        SUBSTRING_INDEX(`facture`.`dates`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`facture`.`dates`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`facture`.`dates`, '/', 1)
      ),
      1,
      IF(`devise` IS NULL OR `devise`='', 'USD', `devise`),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.reception_labo as facture LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;

CALL IMPORT_DEPENSES_LABO();
CALL IMPORT_ENTREES_LABO();


-- caisse labo
DROP PROCEDURE IF EXISTS IMPORT_ENTREES_LABO_DELEGUER;
DELIMITER ;;

CREATE PROCEDURE IMPORT_ENTREES_LABO_DELEGUER()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
DECLARE medecin INT DEFAULT 0;
SELECT COUNT(*) FROM old.reception_labo_deleguer INTO n;
SET i=0;
WHILE i<n DO
  INSERT INTO `patient`(`nom`, `postnom`, `prenom`, `sexe`, `createdAt`, `updatedAt`) SELECT `nom`, `prenom`, `postnom`, IF(`sexe` = 'Homme (H)', 'H', 'F'), now(), now() FROM old.reception_labo_deleguer LIMIT i,1;
  INSERT INTO `document`(`type`, `date`, `departement`, `operateur`, `patient`, `gratuit`, `createdAt`, `updatedAt`)
    SELECT
      'FACTURE',
      CONCAT(
        SUBSTRING_INDEX(`facture`.`dates`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`facture`.`dates`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`facture`.`dates`, '/', 1)
      ),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      IF(`compte` IS NULL OR `compte`='', 'admin', `compte`),
      (SELECT LAST_INSERT_ID()),
      true,
      now(),
      now()
    FROM old.reception_labo_deleguer as facture LIMIT i,1;
  INSERT INTO `ecriture`(`libele`, `montant`, `ecart`, `date`, `taux`, `devise`, `departement`, `document`, `createdAt`, `updatedAt`)
    SELECT
      `examens`,
      `montant`,
      `montant`,
      CONCAT(
        SUBSTRING_INDEX(`facture`.`dates`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`facture`.`dates`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`facture`.`dates`, '/', 1)
      ),
      1,
      IF(`devise` IS NULL OR `devise`='', 'USD', `devise`),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.reception_labo_deleguer as facture LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;

CALL IMPORT_DEPENSES_LABO();
CALL IMPORT_ENTREES_LABO();
CALL IMPORT_ENTREES_LABO_DELEGUER();
