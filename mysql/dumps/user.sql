INSERT
INTO `utilisateur` (`nom`, `prenom`, `identifiant`, `createdAt`, `updatedAt`)
SELECT `nom`, `prenom`, `compte`, now(), now() FROM old.users;

INSERT
INTO `shadow` (`utilisateur`, `password`, `createdAt`, `updatedAt`)
SELECT `compte`, `password`, now(), now() FROM old.users;

INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT IF(`niveau`='cd' OR `niveau`='cs', 'chef-departement', 'encodeur'), `compte`, now(), now() FROM old.users WHERE `niveau` IN('cd', 'cs', 'Encodeur');
INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT 'admin', `compte`, now(), now()  FROM old.users WHERE `compte`='admin';
INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT 'gen:01', `compte`, now(), now()  FROM old.users WHERE `compte`='GN01';
INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT 'gen:02', `compte`, now(), now()  FROM old.users WHERE `compte`='GN02';
INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT 'partenaire', `compte`, now(), now() FROM old.users WHERE `compte`='ultimate';
INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT 'tresorerie', `compte`, now(), now() FROM old.users WHERE `compte`='tresorerie';
INSERT INTO `roles`(`label`, `utilisateur`, `createdAt`, `updatedAt`) SELECT 'cheflabo', `compte`, now(), now() FROM old.users WHERE `compte`='cheflabo';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT 'admin' as `utilisateur`, `id` as `departementId`, now(), now() FROM `departement`;

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT 'tresorerie' as `utilisateur`, `id` as `departementId`, now(), now() FROM `departement`;

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT 'GN01' as `utilisateur`, `id` as `departementId`, now(), now() FROM `departement`;

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT 'GN02' as `utilisateur`, `id` as `departementId`, now(), now() FROM `departement`;

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'), now(), now() FROM old.users WHERE `departement` = 'hcrp';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='HOSPITALISATION'), now(), now() FROM old.users WHERE `departement` = 'hcrp';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `label`='Officine (Hemodialyse)'), now(), now() FROM old.users WHERE `departement` = 'hcrp';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'), now(), now() FROM old.users WHERE `departement` = 'labo' OR `departement` = 'PRELEVE';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='SANG'), now(), now() FROM old.users WHERE `departement` = 'labo' OR `departement` = 'PRELEVE';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='OPHTALMOLOGIE'), now(), now() FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='DENTISTERIE'), now(), now() FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='OFFICINE' AND `reception`=(SELECT `id` FROM `reception` WHERE `intitule`='OPHTALMOLOGIE')), now(), now() FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

INSERT INTO `utilisateur_departement`(`utilisateur`, `departement`, `createdAt`, `updatedAt`)
SELECT `compte`, (SELECT `id` FROM `departement` WHERE `intitule`='LUNETTERIE'), now(), now() FROM old.users WHERE `departement` = 'oph' OR `departement` = 'ultimate' OR `departement`='DENTI-CONTROLE' OR `departement`='OPHTA-CONTROLE';

