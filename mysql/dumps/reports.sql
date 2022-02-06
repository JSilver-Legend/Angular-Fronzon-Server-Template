-- Daily reporting procedure
DROP PROCEDURE IF EXISTS MAKE_VERSEMENTS;
DELIMITER ;;

CREATE PROCEDURE MAKE_VERSEMENTS(IN startDate DATETIME, IN endDate DATETIME, IN targetTypeVersement VARCHAR(10), IN newDate DATETIME)
BEGIN
  DECLARE n INT DEFAULT 0;
  DECLARE i INT DEFAULT 0;
  DECLARE e INT DEFAULT 0;
  DECLARE d INT DEFAULT 0;
  DECLARE dep INT DEFAULT 0;
  DECLARE tauxId INT DEFAULT 0;
  
  SET i=0;
  SELECT COUNT(id) FROM `departement` WHERE `typeVersement`=targetTypeVersement INTO n;

  IF targetTypeVersement="DEBUTMOIS" THEN
    SELECT `id` FROM `departement` WHERE `targetTypeVersement`=targetTypeVersement LIMIT i,1 INTO dep;
    SELECT `taux` FROM `ecriture_tresorerie` WHERE `date` BETWEEN startDate AND endDate LIMIT 1 INTO tauxId;
    SELECT COUNT(id) FROM `ecriture_tresorerie` WHERE `date` BETWEEN startDate AND endDate INTO e;
    SELECT COUNT(id) FROM `ecriture_tresorerie` WHERE `date` BETWEEN DATE_FORMAT(newDate, '%Y-%m-%d 00:00:00') AND DATE_FORMAT(newDate, '%Y-%m-%d 22:59:59') AND libele LIKE '%Report trésorerie%' INTO d;
  ELSE
    SELECT `taux` FROM `ecriture` WHERE `date` BETWEEN startDate AND endDate LIMIT 1 INTO tauxId;
  END IF;
  
  WHILE i<n DO
    
    IF targetTypeVersement!='DEBUTMOIS' THEN
      SELECT `id` FROM `departement` WHERE `targetTypeVersement`=targetTypeVersement LIMIT i,1 INTO dep;
      SELECT COUNT(id) FROM `ecriture` WHERE `departement`=dep AND `date` BETWEEN startDate AND endDate INTO e;
      SELECT COUNT(id) FROM `ecriture_tresorerie` WHERE `departement`=dep AND `date` BETWEEN startDate AND endDate AND libele LIKE 'Versement%' INTO d;
    END IF;

    IF e > 0 AND d = 0 AND targetTypeVersement != 'DEBUTMOIS' THEN
      INSERT INTO `ecriture_tresorerie`(`libele`, `montantSysteme`, `date`, `devise`, `taux`, `departement`, `createdAt`, `updatedAt`)
      SELECT
        CONCAT(
          IF(targetTypeVersement='FINMOIS', 'Versement mensuel - ', 'Versement journalier - '),
          (SELECT `intitule` FROM `departement` WHERE `id`=dep)
        ) as `libele`,
        SUM(IF(`devise`='CDF', `montant` / (SELECT `taux` FROM `taux_de_change` WHERE `id`=tauxId), `montant`)) as `montantSysteme`,
        endDate as `date`,
        'USD' as `devise`,
        tauxId as `taux`,
        dep as `departement`,
        endDate,
        endDate
      FROM `ecriture` as `ecr`
      WHERE `departement`=dep AND `date` BETWEEN startDate AND endDate;
      SELECT 'Done' as '';
    END IF;

    IF e > 0 AND d = 0 AND targetTypeVersement = 'DEBUTMOIS' THEN 
      INSERT INTO `ecriture_tresorerie`(`libele`, `montantSysteme`, `montant`, `date`, `devise`, `taux`, `departement`, `createdAt`, `updatedAt`)
      SELECT
        CONCAT('Report trésorerie - ', DATE_FORMAT(endDate, '%M/%Y')) as `libele`,
        SUM(IF(`devise`='CDF', `montant` / (SELECT `taux` FROM `taux_de_change` WHERE `id`=tauxId), `montant`)) as `montantSysteme`,
        SUM(IF(`devise`='CDF', `montant` / (SELECT `taux` FROM `taux_de_change` WHERE `id`=tauxId), `montant`)) as `montant`,
        newDate as `date`,
        'USD' as `devise`,
        tauxId as `taux`,
        (SELECT `id` FROM `departement` WHERE `intitule`='TRESORERIE') as `departement`,
        newDate,
        newDate
      FROM `ecriture_tresorerie` as `ecr`
      WHERE date BETWEEN startDate AND endDate;
    END IF;
    SET i = i + 1;
  END WHILE;
End;
;;

DELIMITER ;
