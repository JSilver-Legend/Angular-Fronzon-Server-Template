INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 'admin' as `utilisateur`, `id` as `departementId`, true, true, true, now(), now() FROM `departement`;

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 'tresorerie' as `utilisateur`, `id` as `departementId`, true, false, false, now(), now() FROM `departement`;

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 'GN01' as `utilisateur`, `id` as `departementId`, true, false, false, now(), now() FROM `departement`;

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 'GN02' as `utilisateur`, `id` as `departementId`, true, false, false, now(), now() FROM `departement`;

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT
  `compte`,
  (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'),
  true,
  IF(`niveau` = 'Encodeur', true, false),
  false,
  now(),
  now()
FROM old.users WHERE `departement` = 'hrcp';

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 
  `compte`,
  (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
  true,
  IF(`niveau` = 'Encodeur', true, false),
  false,
  now(),
  now()
FROM old.users WHERE `departement` = 'labo' OR `departement` = 'PRELEVE';

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT
  `compte`,
  (SELECT `id` FROM `departement` WHERE `intitule`='OPHTALMOLOGIE'),
  true,
  IF(`niveau` = 'Encodeur', true, false),
  false,
  now(),
  now()
FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT
  `compte`,
  (SELECT `id` FROM `departement` WHERE `intitule`='DENTISTERIE'),
  true,
  IF(`niveau` = 'Encodeur', true, false),
  false,
  now(),
  now()
FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 
  `compte`,
  (SELECT `id` FROM `departement` WHERE `intitule`='OFFICINE' AND `reception`=(SELECT `id` FROM `reception` WHERE `intitule`='OPHTALMOLOGIE')),
  true,
  IF(`niveau` = 'Encodeur', true, false),
  false,
  now(),
  now()
FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

INSERT INTO `autorisation_departement`(`utilisateur`, `departement`, `lecture`, `ecriture`, `modification`, `createdAt`, `updatedAt`)
SELECT 
  `compte`,
  (SELECT `id` FROM `departement` WHERE `intitule`='LUNETTERIE'),
  true,
  IF(`niveau` = 'Encodeur', true, false),
  false,
  now(),
  now()
FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';
