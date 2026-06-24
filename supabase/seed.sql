-- ============================================================================
--  Sample data for the Student Management System
--  Run AFTER schema.sql. Safe to re-run: it clears the table first.
--  created_at values are spread across the last several months so the
--  dashboard charts (monthly trend, "new this month") have something to show.
-- ============================================================================

truncate table public.students restart identity cascade;

insert into public.students
    (matricule, nom, prenom, email, telephone, date_naissance, filiere, adresse, ville, created_at)
values
    ('STD-2024-001', 'El Amrani', 'Yassine', 'yassine.elamrani@example.com', '+212 661-234567', '2003-04-12', 'Génie Informatique', '12 Rue des Orangers', 'Casablanca', now() - interval '3 days'),
    ('STD-2024-002', 'Bennani', 'Salma', 'salma.bennani@example.com', '+212 662-345678', '2002-09-30', 'Génie Civil', '8 Avenue Hassan II', 'Rabat', now() - interval '6 days'),
    ('STD-2024-003', 'Dubois', 'Camille', 'camille.dubois@example.com', '+33 6 12 34 56 78', '2004-01-22', 'Sciences Économiques', '3 Rue de la Paix', 'Lyon', now() - interval '9 days'),
    ('STD-2024-004', 'Tazi', 'Omar', 'omar.tazi@example.com', '+212 663-456789', '2001-11-05', 'Génie Électrique', '45 Boulevard Zerktouni', 'Marrakech', now() - interval '14 days'),
    ('STD-2024-005', 'Moreau', 'Léa', 'lea.moreau@example.com', '+33 7 98 76 54 32', '2003-07-18', 'Mathématiques Appliquées', '21 Rue Victor Hugo', 'Toulouse', now() - interval '20 days'),
    ('STD-2024-006', 'Alaoui', 'Hamza', 'hamza.alaoui@example.com', '+212 664-567890', '2002-03-14', 'Réseaux & Télécoms', '7 Rue Ibn Sina', 'Fès', now() - interval '26 days'),
    ('STD-2024-007', 'Cherkaoui', 'Imane', 'imane.cherkaoui@example.com', '+212 665-678901', '2004-05-09', 'Génie Informatique', '19 Avenue Mohammed V', 'Tanger', now() - interval '33 days'),
    ('STD-2024-008', 'Lefèvre', 'Hugo', 'hugo.lefevre@example.com', '+33 6 55 44 33 22', '2001-12-28', 'Gestion & Management', '5 Place Bellecour', 'Lyon', now() - interval '38 days'),
    ('STD-2024-009', 'Idrissi', 'Nada', 'nada.idrissi@example.com', '+212 666-789012', '2003-08-21', 'Biologie', '33 Rue Allal Ben Abdellah', 'Rabat', now() - interval '45 days'),
    ('STD-2024-010', 'Benjelloun', 'Adam', 'adam.benjelloun@example.com', '+212 667-890123', '2002-02-17', 'Génie Mécanique', '2 Rue de Fès', 'Casablanca', now() - interval '52 days'),
    ('STD-2024-011', 'Garcia', 'Manon', 'manon.garcia@example.com', '+33 7 11 22 33 44', '2004-10-03', 'Sciences Économiques', '14 Rue Nationale', 'Lille', now() - interval '60 days'),
    ('STD-2024-012', 'Ouazzani', 'Zakaria', 'zakaria.ouazzani@example.com', '+212 668-901234', '2001-06-25', 'Génie Industriel', '9 Avenue des FAR', 'Agadir', now() - interval '68 days'),
    ('STD-2024-013', 'Saïdi', 'Khadija', 'khadija.saidi@example.com', '+212 669-012345', '2003-01-11', 'Génie Informatique', '27 Rue Tarik Ibn Ziad', 'Meknès', now() - interval '76 days'),
    ('STD-2024-014', 'Petit', 'Louis', 'louis.petit@example.com', '+33 6 77 88 99 00', '2002-04-19', 'Génie Électrique', '6 Rue du Commerce', 'Bordeaux', now() - interval '85 days'),
    ('STD-2024-015', 'Fassi', 'Rim', 'rim.fassi@example.com', '+212 670-123456', '2004-12-07', 'Réseaux & Télécoms', '41 Boulevard Anfa', 'Casablanca', now() - interval '95 days'),
    ('STD-2024-016', 'Roux', 'Jules', 'jules.roux@example.com', '+33 7 33 44 55 66', '2001-09-13', 'Mathématiques Appliquées', '18 Rue Sainte-Catherine', 'Bordeaux', now() - interval '104 days'),
    ('STD-2024-017', 'Berrada', 'Sofia', 'sofia.berrada@example.com', '+212 671-234567', '2003-03-29', 'Gestion & Management', '11 Rue Oued Sebou', 'Fès', now() - interval '118 days'),
    ('STD-2024-018', 'Lambert', 'Emma', 'emma.lambert@example.com', '+33 6 22 33 44 55', '2002-07-02', 'Biologie', '4 Rue Pasteur', 'Nantes', now() - interval '132 days'),
    ('STD-2024-019', 'Hassani', 'Mehdi', 'mehdi.hassani@example.com', '+212 672-345678', '2004-02-14', 'Génie Civil', '23 Avenue Al Massira', 'Marrakech', now() - interval '150 days'),
    ('STD-2024-020', 'Bernard', 'Chloé', 'chloe.bernard@example.com', '+33 7 66 77 88 99', '2001-10-26', 'Génie Industriel', '16 Rue de la République', 'Marseille', now() - interval '171 days'),
    ('STD-2024-021', 'Naciri', 'Anas', 'anas.naciri@example.com', '+212 673-456789', '2003-05-16', 'Génie Mécanique', '30 Rue Ibn Batouta', 'Tanger', now() - interval '195 days'),
    ('STD-2024-022', 'Faure', 'Sarah', 'sarah.faure@example.com', '+33 6 99 88 77 66', '2002-11-08', 'Génie Informatique', '1 Place de la Comédie', 'Montpellier', now() - interval '220 days'),
    ('STD-2024-023', 'Kabbaj', 'Yousra', 'yousra.kabbaj@example.com', '+212 674-567890', '2004-06-21', 'Sciences Économiques', '38 Avenue Mohammed VI', 'Agadir', now() - interval '255 days'),
    ('STD-2024-024', 'Girard', 'Nathan', 'nathan.girard@example.com', '+33 7 12 13 14 15', '2001-08-04', 'Réseaux & Télécoms', '25 Rue Gambetta', 'Nice', now() - interval '300 days');
