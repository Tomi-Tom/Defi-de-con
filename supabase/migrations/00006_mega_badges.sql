-- ============================================
-- MEGA BADGE EXPANSION — 100+ new badges
-- ============================================

-- STREAK BADGES (progression)
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Debut de flamme', '2 jours de streak', '/badges/fire.svg', 'streak', 2),
  ('Semaine de feu', '5 jours de streak', '/badges/fire.svg', 'streak', 5),
  ('Biweekly Beast', '15 jours de streak', '/badges/lightning.svg', 'streak', 15),
  ('Trois semaines', '21 jours de streak sans faillir', '/badges/muscle.svg', 'streak', 21),
  ('Mois complet', '30 jours de streak', '/badges/crown.svg', 'streak', 30),
  ('45 jours', '45 jours de streak consecutifs', '/badges/diamond.svg', 'streak', 45),
  ('60 jours', '60 jours de streak — deux mois non-stop', '/badges/diamond.svg', 'streak', 60),
  ('90 jours', '90 jours de streak — un trimestre complet', '/badges/crown.svg', 'streak', 90),
  ('Six mois', '180 jours de streak consecutifs', '/badges/crown.svg', 'streak', 180),
  ('Un an', '365 jours de streak — la legende', '/badges/crown.svg', 'streak', 365);

-- COMPLETION BADGES (defis termines)
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Premier defi', 'Complete ton premier defi', '/badges/trophy.svg', 'completion', 1),
  ('Habitue', 'Complete 2 defis', '/badges/trophy.svg', 'completion', 2),
  ('Serial Challenger', 'Complete 7 defis', '/badges/trophy.svg', 'completion', 7),
  ('Decathlonien', 'Complete 10 defis', '/badges/medal.svg', 'completion', 10),
  ('Quart de cent', 'Complete 25 defis', '/badges/medal.svg', 'completion', 25),
  ('Demi-centurion', 'Complete 50 defis', '/badges/crown.svg', 'completion', 50),
  ('Centenaire', 'Complete 100 defis', '/badges/crown.svg', 'completion', 100);

-- POINTS BADGES (accumulation)
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Premiere etoile', 'Atteins 100 points', '/badges/star.svg', 'points', 100),
  ('Demi-millier', 'Atteins 500 points', '/badges/star.svg', 'points', 500),
  ('Millionnaire', 'Atteins 1000 points', '/badges/star.svg', 'points', 1000),
  ('2K Club', 'Atteins 2000 points', '/badges/diamond.svg', 'points', 2000),
  ('5K Runner', 'Atteins 5000 points', '/badges/diamond.svg', 'points', 5000),
  ('10K Legend', 'Atteins 10000 points', '/badges/crown.svg', 'points', 10000),
  ('50K Titan', 'Atteins 50000 points', '/badges/crown.svg', 'points', 50000),
  ('100K God Mode', 'Atteins 100000 points — statut divin', '/badges/crown.svg', 'points', 100000);

-- CUSTOM BADGES — Social & Community
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Sociable', 'Participe a un defi avec 5+ personnes', '/badges/heart.svg', 'custom', 5),
  ('Leader', 'Termine premier dans un defi', '/badges/crown.svg', 'custom', 1),
  ('Top 5', 'Termine dans le top 5 d''un defi', '/badges/podium.svg', 'custom', 5),
  ('Top 10', 'Termine dans le top 10 d''un defi', '/badges/podium.svg', 'custom', 10),
  ('Veterinaire', 'Participe a 10 defis', '/badges/flag.svg', 'custom', 10),
  ('Collectionneur', 'Obtiens 10 badges differents', '/badges/star.svg', 'custom', 10),
  ('Badge Hunter', 'Obtiens 25 badges differents', '/badges/target.svg', 'custom', 25),
  ('Completionniste', 'Obtiens 50 badges differents', '/badges/diamond.svg', 'custom', 50);

-- CUSTOM BADGES — Dedication & Effort
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Matinal', 'Fais une saisie avant 7h du matin', '/badges/sunrise.svg', 'custom', 1),
  ('Noctambule', 'Fais une saisie apres 23h', '/badges/bolt.svg', 'custom', 1),
  ('Weekend Warrior', 'Fais une saisie un samedi ET un dimanche', '/badges/shield.svg', 'custom', 1),
  ('Lundi Motivation', 'Fais une saisie chaque lundi pendant 4 semaines', '/badges/rocket.svg', 'custom', 4),
  ('Sans relache', 'Fais une saisie 7 jours sur 7 pendant 2 semaines', '/badges/lightning.svg', 'custom', 14),
  ('Aucune excuse', 'Fais une saisie un jour ferie', '/badges/shield.svg', 'custom', 1),
  ('Premier de l''an', 'Fais une saisie le 1er janvier', '/badges/star.svg', 'custom', 1),
  ('Resilient', 'Reprends un streak apres l''avoir perdu 3 fois', '/badges/shield.svg', 'custom', 3),
  ('Comeback Kid', 'Atteins un streak de 7 apres avoir perdu un streak de 7+', '/badges/rocket.svg', 'custom', 7);

-- CUSTOM BADGES — Milestones d'entrees
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('10 entrees', '10 saisies au total', '/badges/check-circle.svg', 'custom', 10),
  ('25 entrees', '25 saisies au total', '/badges/check-circle.svg', 'custom', 25),
  ('50 entrees', '50 saisies au total', '/badges/check-circle.svg', 'custom', 50),
  ('200 entrees', '200 saisies au total', '/badges/heart.svg', 'custom', 200),
  ('500 entrees', '500 saisies — demi-millier de jours trackes', '/badges/diamond.svg', 'custom', 500),
  ('1000 entrees', '1000 saisies — legendaire', '/badges/crown.svg', 'custom', 1000);

-- CUSTOM BADGES — Fun & Easter Eggs
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Early Adopter', 'Parmi les 10 premiers inscrits', '/badges/rocket.svg', 'custom', 10),
  ('OG', 'Parmi les 3 premiers inscrits', '/badges/crown.svg', 'custom', 3),
  ('Fidele', 'Membre depuis plus de 6 mois', '/badges/heart.svg', 'custom', 180),
  ('Ancien', 'Membre depuis plus d''un an', '/badges/medal.svg', 'custom', 365),
  ('Multi-defi', 'Participe a 3 defis en meme temps', '/badges/bolt.svg', 'custom', 3),
  ('Hyperactif', 'Participe a 5 defis en meme temps', '/badges/lightning.svg', 'custom', 5),
  ('Perfectionniste', 'Modifie une saisie le meme jour', '/badges/target.svg', 'custom', 1),
  ('Genereux', 'Premiere saisie avec une valeur superieure a l''objectif', '/badges/heart.svg', 'custom', 1),
  ('Minimaliste', 'Complete un defi avec un seul champ', '/badges/check-circle.svg', 'custom', 1),
  ('Maximaliste', 'Complete un defi avec 5+ champs', '/badges/star.svg', 'custom', 5),
  ('Vendredi 13', 'Fais une saisie un vendredi 13', '/badges/bolt.svg', 'custom', 1),
  ('Palindrome', 'Fais une saisie a une date palindrome', '/badges/diamond.svg', 'custom', 1);

-- CUSTOM BADGES — Performance & Records
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Record Personnel', 'Bats ton propre record sur un champ numerique', '/badges/trophy.svg', 'custom', 1),
  ('Double Up', 'Fais le double de l''objectif en une journee', '/badges/muscle.svg', 'custom', 2),
  ('Triple Menace', 'Fais le triple de l''objectif en une journee', '/badges/lightning.svg', 'custom', 3),
  ('Zero Retard', 'Termine un defi avec objectifs sans jamais prendre de retard', '/badges/shield.svg', 'custom', 1),
  ('Rattrapage', 'Rattrape tout ton retard accumule en une seule journee', '/badges/rocket.svg', 'custom', 1),
  ('Progression', 'Ameliore ta valeur chaque jour pendant 7 jours', '/badges/target.svg', 'custom', 7),
  ('Stabilite', 'Meme valeur exacte 5 jours de suite sur un champ', '/badges/check-circle.svg', 'custom', 5),
  ('Explosif', 'Augmente ta valeur de +50% en un jour', '/badges/bolt.svg', 'custom', 1);

-- CUSTOM BADGES — Seasonal & Special
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Resolution', 'Participe a un defi en janvier', '/badges/sunrise.svg', 'custom', 1),
  ('Ete Actif', 'Maintiens un streak pendant tout l''ete (juin-aout)', '/badges/fire.svg', 'custom', 90),
  ('Defi Hivernal', 'Complete un defi entre novembre et fevrier', '/badges/shield.svg', 'custom', 1),
  ('Rentree', 'Lance ou rejoins un defi en septembre', '/badges/rocket.svg', 'custom', 1),
  ('Anniversaire', 'Fais une saisie le jour anniversaire de ton inscription', '/badges/heart.svg', 'custom', 1),
  ('Centenaire du site', 'Present quand le site atteint 100 utilisateurs', '/badges/crown.svg', 'custom', 100),
  ('Millieme saisie', 'Fais la 1000eme saisie globale du site', '/badges/diamond.svg', 'custom', 1000);
