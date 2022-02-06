-- facture_ophta
DROP PROCEDURE IF EXISTS IMPORT_FACTURE_OPHTA_ENTREES;
DELIMITER ;;

CREATE PROCEDURE IMPORT_FACTURE_OPHTA_ENTREES()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
SELECT COUNT(*) FROM old.tas_facture_ophta WHERE `entree_sortie`='entree' AND `categorie` IS NOT NULL AND `categorie` <> '' INTO n;
SET i=0;
WHILE i<n DO 
  INSERT INTO `patient`(`nom`, `createdAt`, `updatedAt`) SELECT `nom_pat`, now(), now() FROM old.tas_facture_ophta  WHERE `entree_sortie`='entree' AND `categorie` IS NOT NULL AND `categorie` <> '' LIMIT i,1;
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
      (SELECT `id` FROM `departement` WHERE `intitule`=UCASE(`categorie`)),
      `agent`,
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.tas_facture_ophta 
    WHERE `entree_sortie`='entree' AND `categorie` IS NOT NULL AND `categorie` <> '' LIMIT i,1;
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
      (SELECT `id` FROM `departement` WHERE `intitule`=UCASE(`categorie`)),
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.tas_facture_ophta
    WHERE `entree_sortie`='entree' AND `categorie` IS NOT NULL AND `categorie` <> '' LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;


DROP PROCEDURE IF EXISTS IMPORT_FACTURE_OPHTA_SORTIES;
DELIMITER ;;

CREATE PROCEDURE IMPORT_FACTURE_OPHTA_SORTIES()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
SELECT COUNT(*) FROM old.tas_facture_ophta WHERE `entree_sortie`='sortie' AND `categorie` IS NOT NULL AND `categorie` <> '' INTO n;
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
      (SELECT `id` FROM `departement` WHERE `intitule`=UCASE(`categorie`)),
      `agent`,
      NULL,
      now(),
      now()
    FROM old.tas_facture_ophta
    WHERE `entree_sortie`='sortie' AND `categorie` IS NOT NULL AND `categorie` <> '' LIMIT i,1;
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
      (SELECT `id` FROM `departement` WHERE `intitule`=UCASE(`categorie`)),
      (SELECT LAST_INSERT_ID()),
      now(),
      now()
    FROM old.tas_facture_ophta
    WHERE `entree_sortie`='sortie' AND `categorie` IS NOT NULL AND `categorie` <> '' LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;

CALL IMPORT_FACTURE_OPHTA_ENTREES();
CALL IMPORT_FACTURE_OPHTA_SORTIES();
