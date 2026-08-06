# F-01 En-tête et menu ==============> fait
1. Ouvrir la page d'accueil.
2. Vérifier la présence des liens `Accueil`, `Articles`, `Domaines`, `Documents`, `À propos`, `Contact`, `Faire un don`.
3. Cliquer sur chaque lien du menu.
4. Vérifier que chaque lien ouvre la bonne page.

# F-02 Menu mobile
1. Ouvrir le site en largeur mobile.
2. Ouvrir le menu mobile.
3. Vérifier que tous les liens principaux sont présents.
4. Cliquer sur chaque lien.
5. Vérifier que la navigation fonctionne correctement.
6. Fermer et rouvrir le menu pour vérifier sa stabilité.

# F-03 Pied de page ==============> fait
1. Ouvrir la page d'accueil.
2. Descendre jusqu'au pied de page.
3. Vérifier la présence des coordonnées de l'association.
4. Vérifier la présence des liens utiles.
5. Cliquer sur le lien HelloAsso.
6. Vérifier que la redirection fonctionne.

# F-04 Pages d'erreur ==============> fait
1. Ouvrir une URL inexistante.
2. Vérifier l'affichage de la page `404`.
3. Provoquer une erreur applicative contrôlée si un scénario existe.
4. Vérifier qu'une page d'erreur lisible s'affiche sans casser le site.

# F-05 Page d'accueil magazine ==============> fait
1. Ouvrir la page d'accueil.
2. Vérifier la présence du hero.
3. Vérifier la présence de la présentation du magazine.
4. Vérifier la présence du carrousel d'actualités.
5. Cliquer sur un élément du carrousel.
6. Vérifier l'ouverture du bon contenu.

# F-06 Liste des articles
1. Ouvrir `/actualites`.
2. Vérifier l'affichage de la liste d'articles.
3. Utiliser la pagination.
4. Vérifier que la page suivante charge correctement.
5. Tester le filtre par mot-clé.
6. Tester le filtre par catégorie.
7. Tester le filtre par domaine.
8. Tester le filtre par auteur.
9. Tester le filtre par dates.
10. Tester le filtre par type.
11. Vérifier que les filtres peuvent se combiner sans erreur.

# F-07 Page article
1. Ouvrir un article publié.
2. Vérifier le titre et les métadonnées.
3. Vérifier l'image de couverture.
4. Vérifier l'affichage du contenu HTML.
5. Vérifier la présence des documents associés.
6. Vérifier la présence des articles similaires.
7. Tester les actions de partage.

# F-08 Système de catégories
1. Ouvrir une page catégorie `/c/{slug}`.
2. Vérifier que seuls les articles de la catégorie apparaissent.
3. Ouvrir plusieurs catégories différentes.
4. Vérifier que le changement de catégorie charge les bonnes listes.

# F-09 Page domaines
1. Ouvrir `/domaines`.
2. Vérifier l'affichage des domaines actifs.
3. Ouvrir un domaine si une fiche détaillée existe.
4. Vérifier la présence du lien de don quand il est configuré.
5. Cliquer sur le lien de don.
6. Vérifier que la redirection fonctionne.

# F-10 Bibliothèque de documents
1. Ouvrir `/documents`.
2. Vérifier l'affichage de la liste des PDF publics.
3. Tester les filtres disponibles.
4. Tester le filtre textuel sur le titre.
5. Tester le filtre textuel sur la description.
6. Vérifier que la liste se met à jour correctement.

# F-11 Consultation et téléchargement PDF
1. Ouvrir un document public depuis la bibliothèque.
2. Vérifier que la consultation fonctionne.
3. Lancer le téléchargement du PDF.
4. Vérifier que le fichier téléchargé est correct et lisible.

# F-12 Page À propos
1. Ouvrir `/a-propos`.
2. Vérifier que le contenu institutionnel s'affiche correctement.
3. Vérifier la mise en page sur desktop et mobile.

# F-13 Page Contact
1. Ouvrir `/contact`.
2. Vérifier la présence du formulaire ou des moyens de contact affichés.
3. Utiliser l'action de contact.
4. Vérifier qu'elle ouvre bien le client mail.

# F-14 Page Don
1. Ouvrir `/don`.
2. Vérifier que la redirection vers HelloAsso se déclenche correctement.

# F-15 Barre de partage
1. Ouvrir une page article sur mobile.
2. Vérifier la présence de la barre de partage.
3. Tester le partage WhatsApp.
4. Tester la copie du lien.
5. Faire défiler la page.
6. Vérifier le comportement sticky si prévu.

# F-16 Métadonnées Open Graph / Twitter
1. Ouvrir un article publié.
2. Inspecter les métadonnées de la page.
3. Vérifier la présence du titre Open Graph.
4. Vérifier la présence de la description.
5. Vérifier la présence de l'image de couverture.
6. Répéter sur plusieurs articles.

# F-17 Données structurées JSON-LD
1. Ouvrir la page d'accueil.
2. Vérifier la présence des données structurées `Organization`.
3. Ouvrir un article.
4. Vérifier la présence des données structurées `Article`.
5. Vérifier la présence des données de fil d'Ariane.

# F-18 Sitemap XML dynamique
1. Ouvrir `/sitemap.xml`.
2. Vérifier que les pages publiques principales sont présentes.
3. Vérifier que les articles publiés y figurent.
4. Vérifier qu'une page admin n'y figure pas.

# F-19 robots.txt
1. Ouvrir `/robots.txt`.
2. Vérifier que le front-office est autorisé.
3. Vérifier que `/admin` est exclu.
4. Vérifier que `/api` est exclu si prévu.

# F-20 Redirections 301
1. Ouvrir une ancienne URL connue.
2. Vérifier qu'une redirection `301` s'applique.
3. Vérifier que la destination finale est correcte.
4. Répéter sur plusieurs anciennes URLs si disponibles.

# F-21 Connexion
1. Ouvrir `/admin/login`.
2. Saisir un compte valide.
3. Se connecter.
4. Vérifier l'accès à l'espace protégé.
5. Tenter une connexion avec un mot de passe invalide.
6. Vérifier l'affichage d'une erreur claire.

# F-22 Création de compte Contributeur
1. Ouvrir la page de création de compte si elle existe.
2. Créer un compte Contributeur valide.
3. Vérifier que le compte est créé.
4. Se connecter avec ce compte.
5. Vérifier qu'il peut accéder aux fonctions contributeur.

# F-23 Déconnexion
1. Se connecter avec un compte valide.
2. Cliquer sur la déconnexion.
3. Vérifier que la session est fermée.
4. Tenter d'ouvrir une page protégée.
5. Vérifier la redirection vers la connexion.

# F-24 Protection des routes
1. Sans être connecté, ouvrir une page `/admin`.
2. Vérifier la redirection vers la connexion.
3. Sans être connecté, tenter d'accéder à une route d'upload protégée si elle est exposée.
4. Vérifier que l'accès est refusé.

# F-25 Restriction admin
1. Se connecter avec un compte Contributeur.
2. Tenter d'ouvrir les pages admin réservées aux administrateurs.
3. Vérifier que l'accès est refusé.
4. Se connecter avec un compte Administrateur.
5. Vérifier que l'accès est autorisé.

# F-26 Mon profil
1. Se connecter.
2. Ouvrir la page de profil.
3. Modifier le nom affiché.
4. Enregistrer.
5. Vérifier que la modification est persistée après rechargement.

# F-27 Changement de mot de passe
1. Se connecter.
2. Ouvrir la page de changement de mot de passe.
3. Saisir un ancien mot de passe incorrect.
4. Vérifier que le changement est refusé.
5. Saisir l'ancien mot de passe correct et un nouveau mot de passe valide.
6. Enregistrer.
7. Se déconnecter.
8. Vérifier que la connexion fonctionne avec le nouveau mot de passe.

# F-28 Guide contributeur
1. Se connecter à l'admin.
2. Ouvrir `/admin/aide`.
3. Vérifier que le guide s'affiche correctement.
4. Vérifier que les sections principales sont lisibles.

# F-29 Dashboard
1. Se connecter à l'admin.
2. Ouvrir le dashboard.
3. Vérifier les compteurs publiés, brouillons, archivés et documents.
4. Vérifier que les données affichées sont cohérentes avec le contenu existant.

# F-30 Liste des articles admin
1. Se connecter avec un compte Contributeur.
2. Ouvrir la liste des articles.
3. Vérifier qu'il ne voit que ses articles.
4. Se connecter avec un compte Administrateur.
5. Ouvrir la même liste.
6. Vérifier qu'il voit tous les articles.

# F-31 Création / édition d'article
1. Se connecter avec un compte Contributeur ou Administrateur.
2. Ouvrir la création d'article.
3. Remplir titre, slug, catégories, extrait, couverture, contenu et statut.
4. Enregistrer.
5. Vérifier que l'article est créé.
6. Rouvrir l'article.
7. Modifier un ou plusieurs champs.
8. Enregistrer.
9. Vérifier que les changements sont visibles.

# F-32 Éditeur riche TipTap
1. Ouvrir l'édition d'un article.
2. Ajouter un titre H2.
3. Ajouter un titre H3.
4. Ajouter du texte en gras.
5. Ajouter du texte en italique.
6. Ajouter une liste.
7. Ajouter un lien.
8. Ajouter une image inline.
9. Enregistrer.
10. Vérifier sur le front que tout le rendu est correct.

# F-33 Enregistrer en brouillon
1. Créer ou éditer un article.
2. Enregistrer l'article en brouillon.
3. Vérifier qu'il apparaît avec le bon statut dans l'admin.
4. Vérifier qu'il n'est pas visible publiquement.

# F-34 Publier
1. Ouvrir un brouillon complet.
2. Publier l'article.
3. Vérifier que le statut devient publié.
4. Ouvrir l'URL publique.
5. Vérifier que l'article est visible.

# F-35 Archiver / republier
1. Ouvrir un article publié.
2. L'archiver.
3. Vérifier qu'il n'est plus visible en front-office.
4. Le republier.
5. Vérifier qu'il redevient visible publiquement.

# F-36 Suppression définitive
1. Ouvrir un article déjà archivé.
2. Lancer la suppression définitive.
3. Confirmer l'action si une confirmation existe.
4. Vérifier que l'article n'apparaît plus dans l'admin ni en front.

# F-37 Aperçu public
1. Ouvrir un article dans l'admin.
2. Utiliser l'aperçu public.
3. Vérifier que l'aperçu correspond au rendu attendu.

# F-38 Upload d'images
1. Ouvrir un formulaire d'article.
2. Téléverser une image de couverture valide.
3. Vérifier que l'upload aboutit.
4. Ajouter une image inline dans l'éditeur.
5. Vérifier son affichage.
6. Tenter d'envoyer un fichier au-delà de la limite si possible.
7. Vérifier qu'une erreur claire est affichée.

# F-39 Upload de PDF
1. Ouvrir la gestion des documents.
2. Téléverser un PDF valide.
3. Vérifier que l'upload aboutit.
4. Vérifier que le document est exploitable côté front si public.
5. Tenter d'envoyer un fichier trop volumineux si possible.
6. Vérifier qu'une erreur claire est affichée.

# F-40 Gestion des documents
1. Créer un document avec ses métadonnées.
2. Le marquer public.
3. Vérifier qu'il apparaît sur `/documents`.
4. Le passer en privé.
5. Vérifier qu'il disparaît du front public.
6. Le lier à un article et/ou à un domaine si l'option existe.
7. Supprimer le document.
8. Vérifier qu'il n'apparaît plus.

# F-41 Suppression d'image Cloudinary
1. Téléverser une image.
2. Déclencher l'action de suppression de l'image.
3. Vérifier que l'image disparaît du contenu ou du média concerné.
4. Vérifier qu'aucune erreur bloquante n'apparaît.

# F-42 Page de test upload
1. Ouvrir `/admin/upload-test`.
2. Vérifier que la page se charge.
3. Tester un upload d'image.
4. Tester un upload de PDF.
5. Vérifier que les deux tests aboutissent correctement.

# F-43 CRUD catégories
1. Se connecter en Administrateur.
2. Créer une catégorie avec nom, slug, description, couleur et ordre.
3. Vérifier qu'elle apparaît dans la liste admin.
4. Modifier la catégorie.
5. Vérifier que les changements sont enregistrés.
6. Vérifier l'impact sur le front si la catégorie est utilisée.
7. Supprimer la catégorie si le scénario est autorisé.
8. Vérifier le comportement attendu.

# F-44 CRUD domaines
1. Se connecter en Administrateur.
2. Créer un domaine avec titre, slug, résumé, description, couverture, couleur, ordre, statut actif, URL de don et catégorie existante obligatoire.
3. Vérifier qu'il apparaît dans la liste admin et qu'aucune nouvelle catégorie n'a été créée.
4. Modifier le domaine, y compris sa catégorie.
5. Vérifier que les changements sont enregistrés.
6. Vérifier sa présence sur le front s'il est actif.
7. Désactiver ou supprimer le domaine selon le flux disponible (la catégorie et ses articles doivent être conservés).
8. Vérifier le comportement attendu.

# F-45 Gestion des utilisateurs
1. Se connecter en Administrateur.
2. Ouvrir la gestion des utilisateurs.
3. Vérifier l'affichage de la liste.
4. Tester les filtres.
5. Créer un utilisateur.
6. Modifier son rôle.
7. Activer ou désactiver son compte.
8. Déclencher un reset de mot de passe si la fonction existe.
9. Vérifier que chaque action fonctionne.

# F-46 Health check
1. Ouvrir `/api/health`.
2. Vérifier que l'endpoint répond.
3. Vérifier la présence des informations sur la base PostgreSQL.
4. Vérifier la présence des informations sur Cloudinary.
5. Vérifier que le statut global est cohérent.

# F-47 En-têtes de sécurité
1. Ouvrir plusieurs pages publiques.
2. Inspecter les en-têtes HTTP.
3. Vérifier `X-Frame-Options`.
4. Vérifier `X-Content-Type-Options` ou équivalent `nosniff`.
5. Vérifier `Referrer-Policy`.
6. Vérifier `Permissions-Policy`.

# FB-01 Accueil forum enrichi
1. Ouvrir `/forum`.
2. Vérifier la présence des rubriques.
3. Vérifier la présence de la vue Importants.
4. Vérifier la présence des liens de navigation complémentaires.
5. Ouvrir plusieurs éléments pour vérifier la cohérence de navigation.

# FB-02 Rubriques multiples
1. Se connecter en Administrateur.
2. Configurer plusieurs rubriques avec des ordres différents.
3. Ouvrir `/forum`.
4. Vérifier que l'ordre affiché correspond à la configuration.
5. Ouvrir chaque rubrique.
6. Vérifier que son contenu est correct.

# FB-03 Création de sujets et réponses
1. Se connecter en Contributeur ou Administrateur.
2. Ouvrir le formulaire de nouveau sujet.
3. Choisir une rubrique.
4. Saisir un titre et un message initial.
5. Publier le sujet.
6. Vérifier qu'il apparaît en front.
7. Ouvrir le sujet.
8. Ajouter une réponse.
9. Vérifier que la réponse apparaît correctement.
10. Se déconnecter.
11. Vérifier qu'un anonyme ne peut pas publier.

# FB-04 Épinglage de sujets
1. Se connecter en Administrateur.
2. Ouvrir un sujet.
3. Déclencher l'action d'épinglage.
4. Ouvrir l'accueil forum et la rubrique concernée.
5. Vérifier que le sujet épinglé remonte en tête.
6. Retirer l'épinglage.
7. Vérifier que le sujet revient à son ordre normal.

# FB-05 Verrouillage / archivage
1. Se connecter en Administrateur.
2. Verrouiller un sujet.
3. Ouvrir le sujet avec un compte autorisé à répondre.
4. Vérifier que la réponse est empêchée.
5. Archiver le sujet.
6. Vérifier qu'il disparaît des listes principales.
7. Ouvrir son URL directe.
8. Vérifier qu'il reste lisible.

# FB-06 Vues complémentaires
1. Ouvrir `/forum/importants`.
2. Vérifier que les sujets mis en avant apparaissent.
3. Ouvrir `/forum/article/{articleSlug}` pour un article lié.
4. Vérifier que seules les discussions liées à cet article apparaissent.

# FB-07 Pagination et URLs propres
1. Créer ou repérer assez de sujets pour avoir plusieurs pages.
2. Ouvrir une rubrique avec pagination.
3. Passer à la page suivante.
4. Vérifier le paramètre `page`.
5. Ouvrir un sujet.
6. Vérifier que son URL est stable et propre.
7. Recharger la page.
8. Vérifier que le contenu reste accessible.

# FB-08 Fil d'Ariane et tris
1. Ouvrir une rubrique puis un sujet.
2. Vérifier la présence du fil d'Ariane.
3. Cliquer sur les éléments du fil d'Ariane.
4. Vérifier le retour aux pages précédentes.
5. Tester les tris disponibles dans une liste de sujets.
6. Vérifier le tri par activité récente.
7. Vérifier le tri par création.
8. Vérifier le tri par réponses.

# FB-09 Article relié à plusieurs discussions
1. Se connecter en Administrateur.
2. Associer plusieurs discussions à un même article.
3. Enregistrer.
4. Vérifier que plusieurs liaisons sont conservées.
5. Revenir plus tard sur l'article.
6. Vérifier que les associations sont toujours présentes.

# FB-10 Affichage sur l'article
1. Ouvrir un article ayant des discussions liées.
2. Vérifier la présence de la section de discussions associées.
3. Vérifier que plusieurs discussions peuvent être listées.
4. Cliquer sur chaque discussion.
5. Vérifier l'ouverture du bon sujet forum.

# FB-11 Affichage dans le sujet
1. Ouvrir un sujet lié à un article.
2. Vérifier la présence du bloc d'article de référence.
3. Vérifier que le titre et le lien de l'article sont corrects.
4. Cliquer sur le lien.
5. Vérifier l'ouverture du bon article.

# FB-12 Association depuis l'éditorial
1. Se connecter dans l'espace éditorial avec les droits adéquats.
2. Ouvrir la fiche d'un article.
3. Associer une discussion existante.
4. Enregistrer.
5. Vérifier la présence de l'association en front.
6. Revenir sur la fiche article.
7. Créer une nouvelle discussion liée depuis cet espace si l'option existe.
8. Vérifier que la discussion est créée et liée à l'article.

# FB-13 Tableau de modération
1. Se connecter en Administrateur.
2. Ouvrir `/admin/forum`.
3. Vérifier la présence du tableau de modération.
4. Vérifier l'affichage des sujets et messages récents.
5. Tester les filtres de statut si disponibles.
6. Vérifier que les données affichées sont exploitables.

# FB-14 Actions de modération étendues
1. Se connecter en Administrateur.
2. Masquer un contenu forum.
3. Vérifier qu'il disparaît du front public.
4. Supprimer logiquement un contenu.
5. Vérifier qu'il n'est plus visible publiquement.
6. Verrouiller puis déverrouiller un sujet.
7. Vérifier l'effet sur la réponse.
8. Mettre un sujet en avant.
9. Vérifier sa remontée dans les vues concernées.
10. Déplacer un sujet dans une autre rubrique.
11. Vérifier que la nouvelle rubrique est bien prise en compte en front.

# FB-15 Gestion des permissions forum
1. Sans être connecté, tenter de créer un sujet.
2. Vérifier que l'action est refusée.
3. Se connecter en Contributeur.
4. Vérifier qu'il peut créer un sujet et répondre.
5. Vérifier qu'il ne peut pas accéder à la modération.
6. Se connecter en Administrateur.
7. Vérifier qu'il peut modérer et gérer le forum.

# FB-16 Notifications par e-mail
1. Créer un sujet avec un premier utilisateur connecté.
2. Répondre à ce sujet avec un second utilisateur connecté.
3. Répondre à nouveau avec un troisième utilisateur connecté.
4. Vérifier que l'auteur du sujet reçoit un e-mail.
5. Vérifier que l'auteur de la réponse précédente reçoit un e-mail.
6. Vérifier que l'auteur de la nouvelle réponse ne reçoit pas son propre e-mail.
7. Vérifier que le lien contenu dans l'e-mail ouvre le bon sujet.
8. Répéter avec plusieurs participants pour vérifier la déduplication.

# FB-17 Recherche full-text forum
1. Créer ou repérer des sujets et réponses contenant des mots distinctifs.
2. Ouvrir `/forum/recherche`.
3. Rechercher un mot présent dans un titre de sujet.
4. Vérifier que le sujet attendu apparaît.
5. Rechercher un mot présent uniquement dans une réponse.
6. Vérifier que le sujet ou le message pertinent apparaît.
7. Tester la pagination des résultats si plusieurs résultats existent.
8. Masquer ou supprimer logiquement un contenu.
9. Vérifier qu'il n'apparaît plus dans les résultats publics.

# FB-18 Édition enrichie sujets / messages
1. Se connecter avec l'auteur d'un sujet ou d'un message.
2. Modifier le contenu.
3. Enregistrer.
4. Vérifier que les changements apparaissent.
5. Tenter d'enregistrer un contenu incomplet ou invalide.
6. Vérifier que les validations bloquent l'enregistrement.
7. Saisir du contenu HTML ou potentiellement dangereux.
8. Enregistrer.
9. Vérifier que le contenu affiché est correctement sanitizé.
10. Se connecter en Administrateur.
11. Vérifier qu'il peut modifier si cette règle est prévue.
