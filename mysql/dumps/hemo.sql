-- caisse labo
DROP PROCEDURE IF EXISTS IMPORT_ENTREES_HEMO;
DELIMITER ;;

CREATE PROCEDURE IMPORT_ENTREES_HEMO()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
SELECT COUNT(*) FROM old.ogi_tas_commandes WHERE `entree_sortie`='entree' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' INTO n;
SET i=0;
WHILE i<n DO 
  INSERT INTO `patient`(`nom`, `createdAt`, `updatedAt`) SELECT `nom_pat`, now(), now() FROM old.ogi_tas_commandes WHERE `entree_sortie`='entree' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' LIMIT i,1;
  INSERT INTO `document`(`type`, `date`, `departement`, `operateur`, `patient`, `createdAt`, `updatedAt`)
    SELECT
      'FACTURE',
      CONCAT(
        SUBSTRING_INDEX(`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`datecom`, '/', 1)
      ),
      (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'),
      `agent`,
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.ogi_tas_commandes
    WHERE `entree_sortie`='entree' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' LIMIT i,1;
  INSERT INTO `ecriture`(`libele`, `montant`, `date`, `taux`, `devise`, `departement`, `document`, `createdAt`, `updatedAt`)
    SELECT
      `libacte`,
      `prix`,
      CONCAT(
        SUBSTRING_INDEX(`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`datecom`, '/', 1)
      ),
      1,
      IF(`devise` IS NULL OR `devise`='', 'USD', `devise`),
      (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'),
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.ogi_tas_commandes
    WHERE `entree_sortie`='entree' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;


-- depenses_laboratoire
DROP PROCEDURE IF EXISTS IMPORT_DEPENSES_HEMO;
DELIMITER ;;

CREATE PROCEDURE IMPORT_DEPENSES_HEMO()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
SELECT COUNT(*) FROM old.ogi_tas_commandes WHERE `entree_sortie`='sortie' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' INTO n;
SET i=0;
WHILE i<n DO 
  INSERT INTO `document`(`type`, `date`, `departement`, `operateur`, `patient`, `createdAt`, `updatedAt`)
    SELECT
      'BON',
      CONCAT(
        SUBSTRING_INDEX(`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`datecom`, '/', 1)
      ),
      (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
      `agent`,
      NULL,
      now(),
      now()
    FROM old.ogi_tas_commandes
    WHERE `entree_sortie`='entree' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' LIMIT i,1;
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
    FROM old.ogi_tas_commandes
    WHERE `entree_sortie`='entree' AND `datecom` <> '0000-00-00' AND `datecom` <> 'v'  AND agent <> '' LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;

CALL IMPORT_ENTREES_HEMO();
CALL IMPORT_DEPENSES_HEMO();
