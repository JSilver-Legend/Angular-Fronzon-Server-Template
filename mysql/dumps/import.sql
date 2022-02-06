use emss;

INSERT INTO `reception` (`intitule`, `description`, `createdAt`, `updatedAt`) VALUES
('Ophtalmologie', 'Ophta/Denti', now(), now()),
('Laboratoire', 'Laboratoire', now(), now()),
('Hemodialyse', 'Hemodialyse', now(), now());

INSERT INTO `departement` (`intitule`, `label`, `reception`, `typeVersement`, `createdAt`, `updatedAt`) VALUES
('OPHTALMOLOGIE', 'Ophtalmologie', (SELECT `id` FROM `reception` WHERE `intitule`='Ophtalmologie'), 'FINMOIS', now(), now()),
('DENTISTERIE', 'Dentisterie', (SELECT `id` FROM `reception` WHERE `intitule`='Ophtalmologie'), 'FINMOIS', now(), now()),
('OFFICINE', 'Officine (Denti/Ophta)', (SELECT `id` FROM `reception` WHERE `intitule`='Ophtalmologie'), 'FINMOIS', now(), now()),
('LUNETTERIE', 'Lunetterie', (SELECT `id` FROM `reception` WHERE `intitule`='Ophtalmologie'), 'FINMOIS', now(), now()),
('HEMODIALYSE', 'Service de dialyse', (SELECT `id` FROM `reception` WHERE `intitule`='Hemodialyse'), 'JOURNALIER', now(), now()),
('HOSPITALISATION', 'Hospitalisation', (SELECT `id` FROM `reception` WHERE `intitule`='Hemodialyse'), 'JOURNALIER', now(), now()),
('OFFICINE', 'Officine (Hemodialyse)', (SELECT `id` FROM `reception` WHERE `intitule`='Hemodialyse'), 'JOURNALIER', now(), now()),
('TRESORERIE', 'Trésorerie', NULL, 'DEBUTMOIS', now(), now()),
('LABORATOIRE', 'Service laboratoire', (SELECT `id` FROM `reception` WHERE `intitule`='Laboratoire'), 'FINMOIS', now(), now()),
('SANG', 'Banque de sang', (SELECT `id` FROM `reception` WHERE `intitule`='Laboratoire'), 'FINMOIS', now(), now()),
('URGENCES', 'Urgences', NULL, 'FINMOIS', now(), now()),
('MATERNITE', 'Maternité', NULL, 'FINMOIS', now(), now());

INSERT INTO `devise` VALUES
('USD', now(), now()),
('CDF', now(), now());

INSERT INTO `taux_de_change` (`de`, `vers`, `taux`, `date`, `createdAt`, `updatedAt`)
VALUES('CDF', 'USD', 2030, '2019/1/1', now(), now()),
('CDF', 'USD', 2010, '2021/1/1', now(), now());

INSERT INTO `compte` (`code`, `intitule`, `createdAt`, `updatedAt`)
VALUES
('INNET', 'Internet', now(), now()),
('TSOIFO', 'TSO-IFO', now(), now()),
('ULTIM', 'Ultimate', now(), now()),
('HONMEDE', 'Honoraires Médecins (Dentisterie)', now(), now()),
('HONMEOP', 'Honoraires Médecins (Ophtalmologie)', now(), now()),
('HONMELA', 'Honoraires Médecins (Laboratoire)', now(), now()),
('HONMEHE', 'Honoraires Médecins (Hemodialyse)', now(), now()),
('INTRAHE', 'Intrants (Hémodialyse)', now(), now()),
('INTRAOP', 'Intrants (Ophtalmologie)', now(), now()),
('INTRADE', 'Intrants (Dentisterie)', now(), now()),
('REACTLA', 'Réactifs et consommables (Laboratoire)', now(), now()),
('REACTDE', 'Réactifs et consommables (Dentisterie)', now(), now()),
('EMSS', 'EMSS', now(), now()),
('MAINTLA', 'Entretient et maintenance (Laboratoire)', now(), now()),
('FONCTOP', 'Fonctionnement (Ophtalmologie)', now(), now()),
('FONCTDE', 'Fonctionnement (Dentisterie)', now(), now()),
('PERSOLA', 'Personnel (Laboratoire)', now(), now()),
('PERSOHE', 'Personnel (Hémodialyse)', now(), now()),
('FF', 'FF', now(), now()),
('INCOH', 'Intrants et consommables de dialyse', now(), now()),
('PSOSHE', 'Personnel soignant et surface (Hemodialyse)', now(), now()),
('REPEC', 'Repas, eau, communication', now(), now()),
('TREEM', "Traitement d'eau, entretient machines", now(), now()),
('CARBU', 'Carburant', now(), now()),
('CONBEOP', 'Consommables bureau et entretient (Ophtalmologie)', now(), now()),
('CONBEDE', 'Consommables bureau et entretient (Dentisterie)', now(), now()),
('CONBELA', 'Consommables bureau et entretient (Laboratoire)', now(), now()),
('CONBEHE', 'Consommables bureau et entretient (Hémodialyse)', now(), now()),
('MEDVI', 'Médecin visiteur', now(), now()),
('PRESMLA', 'Prime personnel de surface et maintenance (Laboratoire)', now(), now()),
('PRIMELA', 'Prime personnel (Laboratoire)', now(), now()),
('PRIMEDE', "Personnel d'appoint (Dentisterie)", now(), now()),
('PRIMEOP', 'Prime personnel (Ophtalmologie)', now(), now());

INSERT INTO `equation_repartition`(`departement`, `script`, `formatAffichable`, `date`, `createdAt`, `updatedAt`)
VALUES(
  (SELECT `id` FROM `departement` WHERE `intitule`='OPHTALMOLOGIE'),
  'fixed(0.5, "INNET");ratio(50, "ULTIM");ratio(30, "EMSS");ratio(25, "FONCTOP");ratio(4, "HONMEOP");',
  '{"fixed": { "amount": 0.5, "label": "INNET" },"ratio": [{ "amount": 50, "label": "ULTIM" },{ "amount": 30, "label": "EMSS" },{ "amount": 25, "label": "FONCTOP" },{ "amount": 5, "label": "HONMEOP" }]}',
  '2019/1/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='DENTISTERIE'),
  'fixed(0.5, "INNET");ratio(50, "ULTIM");ratio(30, "EMSS");ratio(25, "FONCDE");ratio(4, "HONMEDE");',
  '{"fixed": { "amount": 0.5, "label": "INNET" },"ratio": [{ "amount": 50, "label": "ULTIM" },{ "amount": 30, "label": "EMSS" },{ "amount": 25, "label": "FONCTDE" },{ "amount": 5, "label": "HONMEDE" }]}',
  '2019/1/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'),
  'fixed(1, "INNET");ratio(50, "INTRAHE");ratio(25, "PERSOHE");ratio(15, "EMSS");ratio(10, "FF");',
  '{"fixed": { "amount": 1, "label": "INNET" },  "ratio": [{ "amount": 50, "label": "INTRAHE" },{"amount": 50, "ratio": [{ "amount": 50, "label": "PERSOHE" },{ "amount": 30, "label": "EMSS" },{ "amount": 20, "label": "FF" }]}]}',
  '2020/11/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
  'fixed(0.5, "INNET");ratio(10, "HONMELA"),ratio(45, "REACTLA");ratio(20.25, "PERSOLA");ratio(13.5, "EMSS");ratio(11.25, "MAINTLA");}',
  '{"fixed": { "amount": 0.5, "label": "INNET" },"ratio": [{ "amount": 10, "label": "HONMELA"},{ "amount": 90, "ratio": [{ "amount": 50, "label": "REACTLA" },{ "amount": 50, "ratio": [{ "amount": 45, "label": "PERSOLA" },{ "amount": 30, "label": "EMSS" },{ "amount": 25, "label": "MAINTLA" }]}]}]}',
  '2020/6/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='LABORATOIRE'),
  'fixed(0.5, "INNET");ratio(50, "REACTLA");ratio(5, "HONMELA");ratio(15, "EMSS");ratio(20, "PRIMELA");ratio(7.5, "PRESMLA");ratio(2.5, "CONBELA");',
  '{"fixed": { "amount": 0.5, "label": "INNET" },"ratio": [{ "amount": 50, "label": "REACTLA" },{ "amount": 50, "ratio": [{ "amount": 10, "label": "HONMELA" },{ "amount": 30, "label": "EMSS" },{ "amount": 40, "label": "PRIMELA" },{ "amount": 15, "label": "PRESMLA" },{ "amount": 5, "label": "CONBELA" }]}]}',
  '2020/12/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='HEMODIALYSE'),
  'fixed(1, "INNET");ratio(50, "INCOH");ratio(5, "HONMEHE");ratio(15, "EMSS");ratio(20, "PSOSHE");ratio(2, "REPEC");ratio(2, "TREEM");ratio(1.5, "CARBU");ratio(2, "CONBEHE");ratio(2.5, "MEDVI");',
  '{"fixed": { "amount": 1, "label": "INNET" },"ratio": [{ "amount": 50, "label": "INCOH"},{ "amount": 50, "ratio": [{ "amount": 10, "label": "HONMEHE" },{ "amount": 30, "label": "EMSS" },{ "amount": 40, "label": "PSOSHE" },{ "amount": 4, "label": "REPEC" },{ "amount": 4, "label": "TREEM" },{ "amount": 3, "label": "CARBU" },{ "amount": 4, "label": "CONBEHE" },{ "amount": 5, "label": "MEDVI" }]}]}',
  '2020/12/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='OPHTALMOLOGIE'),
  'fixed(0.5, "INNET");ratio(40, "ULTIM");ratio(30, "EMSS");ratio(20, "HONMEOP");ratio(4, "TSOIFO");ratio(3, "PRIMEOP");ratio(1, "INTRAOP");ratio(2, "CONBEOP");',
  '{"fixed": { "amount": 0.5, "label": "INNET" },"ratio": [{ "amount": 40, "label": "ULTIM" },{ "amount": 30, "label": "EMSS" },{ "amount": 20, "label": "HONMEOP" },{ "amount": 4, "label": "TSOIFO" },{ "amount": 3, "label": "PRIMEOP" },{ "amount": 1, "label": "INTRAOP" },{ "amount": 2, "label": "CONBEOP" }]}',
  '2020/12/1',
  now(),
  now()
),
(
  (SELECT `id` FROM `departement` WHERE `intitule`='DENTISTERIE'),
  'fixed(0.5, "INNET");ratio(40, "ULTIM");ratio(30, "EMSS");ratio(20, "HONMEDE");ratio(6, "PRIMEDE");ratio(2, "REACTDE");ratio(2, "CONBEDE");',
  '{"fixed": { "amount": 0.5, "label": "INNET" },"ratio": [{ "amount": 40, "label": "ULTIM" },{ "amount": 30, "label": "EMSS" },{ "amount": 20, "label": "HONMEDE" },{ "amount": 6, "label": "PRIMEDE" },{ "amount": 2, "label": "REACTDE" },{ "amount": 2, "label": "CONBEDE" }]}',
  '2020/12/1',
  now(),
  now()
);

select 'Importing users' AS '';
source user.sql;

select 'Defining roles' AS '';
source roles.sql;

select 'Importing everything from ophta-denti' AS '';
source ophta_denti.sql;

select 'Importing everything from hemodialyse' AS '';
source hemo.sql;

select 'Importing everything from laboratoire' AS '';
source labo.sql;

select 'Importing everything from tresorerie' AS '';
source tresorerie.sql;

select 'Creating stored procedures' AS '';
source reports.sql;
