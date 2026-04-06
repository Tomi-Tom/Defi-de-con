-- ============================================
-- More motivational quotes — bulk insert
-- ============================================

-- DAILY quotes (shown on dashboard)
insert into motivational_quotes (text, author, context) values
  ('Le plus dur c''est de commencer. Apres, c''est juste de ne pas s''arreter.', null, 'daily'),
  ('Tu ne regretteras jamais d''avoir fait l''effort.', null, 'daily'),
  ('Les limites n''existent que dans ta tete.', null, 'daily'),
  ('Ce n''est pas la force qui manque, c''est la volonte.', 'Victor Hugo', 'daily'),
  ('Le talent, c''est l''envie. Tout le reste, c''est de la sueur.', 'Jacques Brel', 'daily'),
  ('Ne compte pas les jours, fais que les jours comptent.', 'Muhammad Ali', 'daily'),
  ('La victoire appartient au plus perseverant.', 'Napoleon Bonaparte', 'daily'),
  ('Celui qui deplace la montagne, c''est celui qui commence par enlever les petites pierres.', 'Confucius', 'daily'),
  ('Le seul echec, c''est d''arreter d''essayer.', null, 'daily'),
  ('Transforme ta douleur en puissance.', null, 'daily'),
  ('Un jour ou jour un. C''est toi qui decides.', null, 'daily'),
  ('Fais-le pour la version de toi qui va regarder en arriere avec fierte.', null, 'daily'),
  ('Le confort est l''ennemi du progres.', null, 'daily'),
  ('Rien de grand ne s''est fait sans passion.', 'Hegel', 'daily'),
  ('N''attends pas le bon moment. Cree-le.', null, 'daily'),
  ('Soit tu trouves un chemin, soit tu en crees un.', null, 'daily'),
  ('Ton seul adversaire, c''est celui dans le miroir.', null, 'daily'),
  ('Il n''y a pas de raccourci vers un endroit qui en vaut la peine.', null, 'daily'),
  ('Chaque rep compte. Chaque jour compte. Chaque effort compte.', null, 'daily'),
  ('Le corps accomplit ce que l''esprit croit.', null, 'daily'),
  ('Deviens la personne qui t''aurait inspire quand tu etais plus jeune.', null, 'daily'),
  ('La motivation te fait commencer. L''habitude te fait continuer.', null, 'daily'),
  ('Fais quelque chose aujourd''hui dont tu seras fier demain.', null, 'daily'),
  ('Quand tu veux abandonner, rappelle-toi pourquoi tu as commence.', null, 'daily'),
  ('Si c''etait facile, tout le monde le ferait.', null, 'daily');

-- ENTRY_SUBMITTED quotes (shown after daily entry)
insert into motivational_quotes (text, author, context) values
  ('Un de plus dans la boite. Tu assures.', null, 'entry_submitted'),
  ('Saisie validee. Tu es plus fort qu''hier.', null, 'entry_submitted'),
  ('Fait. Et demain, on recommence. Comme un champion.', null, 'entry_submitted'),
  ('Encore un jour de plus vers la victoire.', null, 'entry_submitted'),
  ('Tu viens de prouver que tu peux. Encore.', null, 'entry_submitted'),
  ('Les petits efforts quotidiens creent des resultats extraordinaires.', null, 'entry_submitted'),
  ('C''est dans la boite ! Rendez-vous demain.', null, 'entry_submitted'),
  ('Bravo. La constance, c''est ton super-pouvoir.', null, 'entry_submitted'),
  ('Saisie du jour : OK. Motivation : intacte.', null, 'entry_submitted'),
  ('Un pas de plus. La ligne d''arrivee se rapproche.', null, 'entry_submitted'),
  ('Tu viens de battre tous ceux qui n''ont rien fait aujourd''hui.', null, 'entry_submitted'),
  ('Le futur toi te remercie deja.', null, 'entry_submitted');

-- STREAK_LOST quotes (shown when streak breaks)
insert into motivational_quotes (text, author, context) values
  ('Tomber, c''est humain. Se relever, c''est heroique.', null, 'streak_lost'),
  ('Une pause n''est pas un abandon. Reviens plus fort.', null, 'streak_lost'),
  ('Les champions aussi ont des jours off. L''important, c''est demain.', null, 'streak_lost'),
  ('Pas de stress. On recommence a zero et on construit mieux.', null, 'streak_lost'),
  ('Rappelle-toi : chaque streak a commence au jour 1.', null, 'streak_lost'),
  ('L''echec n''est pas le contraire du succes, c''est une etape.', null, 'streak_lost'),
  ('C''est pas la chute qui compte, c''est le rebond.', null, 'streak_lost'),
  ('Oublie hier. Concentre-toi sur aujourd''hui.', null, 'streak_lost'),
  ('Meme les meilleurs ont des moments difficiles. Ce qui compte, c''est de revenir.', null, 'streak_lost');

-- STREAK_MILESTONE quotes (shown on streak achievements)
insert into motivational_quotes (text, author, context) values
  ('Serie en feu ! Personne ne peut t''arreter.', null, 'streak_milestone'),
  ('Cette regularite force le respect. Continue !', null, 'streak_milestone'),
  ('Tu es une machine. Literalement.', null, 'streak_milestone'),
  ('Streak historique ! Tu rentres dans la legende.', null, 'streak_milestone'),
  ('La constance est la mere de la maitrise. Et tu maitrises.', null, 'streak_milestone'),
  ('Impressionnant. Tu repousses tes limites chaque jour.', null, 'streak_milestone'),
  ('Ce streak, c''est la preuve que tu peux tout faire.', null, 'streak_milestone'),
  ('Jour apres jour, tu prouves que rien ne peut t''arreter.', null, 'streak_milestone');

-- RANK_UP quotes (shown when climbing leaderboard)
insert into motivational_quotes (text, author, context) values
  ('Tu grimpes dans le classement ! La concurrence tremble.', null, 'rank_up'),
  ('Nouveau rang ! Tu te rapproches du sommet.', null, 'rank_up'),
  ('Les autres te voient monter. Et ils savent que tu ne vas pas t''arreter.', null, 'rank_up'),
  ('Classement mis a jour. Spoiler : tu montes.', null, 'rank_up'),
  ('Rang superieur atteint. Le podium est en vue.', null, 'rank_up'),
  ('Tu viens de depasser un adversaire de plus. Le sommet t''attend.', null, 'rank_up'),
  ('La competition te va bien. Continue de grinder.', null, 'rank_up'),
  ('Chaque point te rapproche de la premiere place. Lache rien.', null, 'rank_up');
