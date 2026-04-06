-- More badges for gamification depth
insert into badges (name, description, icon_url, condition_type, condition_value) values
  ('Regulier', '3 jours de streak', '/badges/check-circle.svg', 'streak', 3),
  ('Machine', '21 jours de streak', '/badges/muscle.svg', 'streak', 21),
  ('Legendaire', '30 jours de streak', '/badges/crown.svg', 'streak', 30),
  ('Leve-tot', 'Premiere saisie avant 8h', '/badges/sunrise.svg', 'custom', 1),
  ('Rapide', 'Saisie en moins de 10 secondes', '/badges/bolt.svg', 'custom', 1),
  ('Explorer', 'Participe a 3 defis differents', '/badges/rocket.svg', 'custom', 3),
  ('Sniper', '10 jours de streak', '/badges/target.svg', 'streak', 10),
  ('Diamant', '50 jours de streak cumules', '/badges/diamond.svg', 'custom', 50),
  ('Protecteur', 'Aide un autre participant', '/badges/shield.svg', 'custom', 1),
  ('Passione', '100 entrees au total', '/badges/heart.svg', 'custom', 100),
  ('Centurion', '100 jours de streak cumules', '/badges/muscle.svg', 'custom', 100),
  ('Elite', 'Top 1 dans un defi', '/badges/crown.svg', 'custom', 1),
  ('Marathonien', 'Complete 5 defis', '/badges/rocket.svg', 'completion', 5),
  ('Invincible', 'Complete un defi a 100% sans manquer un seul jour', '/badges/shield.svg', 'custom', 1);
