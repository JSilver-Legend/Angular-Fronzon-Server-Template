-- tresorerie
-- entrees
DROP PROCEDURE IF EXISTS IMPORT_ENTREES_TRESORERIE;
DELIMITER ;;

CREATE PROCEDURE IMPORT_ENTREES_TRESORERIE()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
DECLARE s INT DEFAULT 0;
SELECT COUNT(*) FROM old.tresorerie WHERE `entree_sortie`='entree' INTO n;
SET i=0;
WHILE i<n DO 
  SELECT SUM(`prix`) FROM old.ogi_tas_commandes WHERE `datecom`=(SELECT `datecom` FROM old.tresorerie WHERE `entree_sortie`='entree' LIMIT i,1) INTO s;
  INSERT INTO `ecriture_tresorerie`(`libele`, `montant`, `montantSysteme`, `departement`, `date`, `taux`, `devise`, `createdAt`, `updatedAt`)
    SELECT
      `libacte`,
      `prix`,
      IF(s IS NULL, 0, s),
      (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'),
      CONCAT(
        SUBSTRING_INDEX(`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`datecom`, '/', 1)
      ),
      1,
      IF(`devise` IS NULL OR `devise`='', 'USD', `devise`),
      now(),
      now()
    FROM old.tresorerie AS `ecriture`
    WHERE `entree_sortie`='entree' LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;


-- sorties
DROP PROCEDURE IF EXISTS IMPORT_DEPENSES_TRESORERIE;
DELIMITER ;;

CREATE PROCEDURE IMPORT_DEPENSES_TRESORERIE()
BEGIN
DECLARE n INT DEFAULT 0;
DECLARE i INT DEFAULT 0;
SELECT COUNT(*) FROM old.tresorerie WHERE `entree_sortie`='sortie' INTO n;
SET i=0;
WHILE i<n DO 
  INSERT INTO `document`(`type`, `date`, `operateur`, `createdAt`, `updatedAt`)
    SELECT
      'BON',
      CONCAT(
        SUBSTRING_INDEX(`datecom`, '/', -1),
        '/',
        SUBSTRING_INDEX(SUBSTRING_INDEX(`datecom`, '/', -2), '/', 1),
        '/',
        SUBSTRING_INDEX(`datecom`, '/', 1)
      ),
      `agent`,
      now(),
      now()
    FROM old.tresorerie 
    WHERE `entree_sortie`='sortie' LIMIT i,1;
  INSERT INTO `ecriture_tresorerie`(`libele`, `montantSysteme`, `date`, `taux`, `devise`, `createdAt`, `updatedAt`)
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
      now(),
      now()
    FROM old.tresorerie
    WHERE `entree_sortie`='sortie' LIMIT i,1;
  SET i = i + 1;
END WHILE;
End;
;;

DELIMITER ;

CALL IMPORT_ENTREES_TRESORERIE();
CALL IMPORT_DEPENSES_TRESORERIE();
