# Opérations — MEEED Magazine

Procédures de sauvegarde, bascule DNS et checklist de mise en production.

---

## Sauvegarde base de données

### Heroku Postgres (production)

```bash
# Export complet (format custom PostgreSQL)
heroku pg:backups:capture -a votre-app
heroku pg:backups:download -a votre-app

# Ou export SQL
heroku pg:psql -a votre-app -c "\copy (SELECT * FROM \"User\") TO STDOUT CSV HEADER" > users_backup.csv
```

**Recommandation** : activer les sauvegardes automatiques Heroku Postgres (plan Essential inclut des backups).

### Restauration

```bash
heroku pg:backups:restore b001 DATABASE_URL -a votre-app
```

### Local (développement)

```bash
docker compose up -d
pg_dump -h localhost -U postgres -d meeed_dev -F c -f backup_meeed_$(date +%Y%m%d).dump
```

---

## Bascule DNS (meeed.fr → Heroku)

### Prérequis

- [ ] Site déployé et testé sur l'URL Heroku (`*.herokuapp.com`)
- [ ] `NEXTAUTH_URL` configuré avec le domaine final
- [ ] Seed exécuté et mot de passe admin changé
- [ ] `/api/health` retourne `200`
- [ ] Upload image/PDF testé en production
- [ ] Redirections 301 vérifiées (anciennes URLs)

### Étapes DNS

```bash
heroku domains:add meeed.fr -a votre-app
heroku domains:add www.meeed.fr -a votre-app
heroku domains -a votre-app
```

Configurer chez le registrar :

| Type | Nom | Valeur |
|------|-----|--------|
| CNAME ou ALIAS | `@` ou `meeed.fr` | Selon instructions Heroku (DNS Target) |
| CNAME | `www` | DNS Target Heroku |

### Après bascule

```bash
heroku config:set NEXTAUTH_URL=https://meeed.fr -a votre-app
```

- [ ] Tester `https://meeed.fr` et `https://www.meeed.fr`
- [ ] Tester login admin en HTTPS
- [ ] Tester partage WhatsApp d'un article (titre + image + description)
- [ ] Vérifier les redirections : `/a-propos-de`, `/nos-projets`, `/tracteur-retrofit`, etc.
- [ ] Communiquer la date de bascule aux contributeurs
- [ ] Garder l'ancien site Infomaniak actif 2–4 semaines en parallèle, puis le désactiver

---

## Checklist tests utilisateur (Phase 9)

### Parcours contributeur

- [ ] Login `/admin/login`
- [ ] Créer un article (titre, extrait, contenu, catégorie)
- [ ] Uploader une image de couverture
- [ ] Associer un PDF public
- [ ] Publier et vérifier sur le site public
- [ ] Partager l'article sur WhatsApp (mobile)

### Site public

- [ ] Navigation mobile (menu hamburger, recherche)
- [ ] Lecture article + téléchargement PDF
- [ ] Recherche par mot-clé
- [ ] Pages institutionnelles (à propos, contact, projets)
- [ ] Formulaire contact (ouverture client mail)

### Accessibilité (rapide)

- [ ] Lien « Aller au contenu principal » au clavier
- [ ] Contrastes lisibles (texte / fond)
- [ ] Images avec attribut `alt`
- [ ] Navigation au clavier dans le menu admin

---

## Assistant de démonstration interactive

Panneau flottant + spotlight pour guider une démo live (parcours Visiteur / Contributeur / Admin).

### Activation

Dans `.env` (local) ou config Heroku :

```bash
NEXT_PUBLIC_DEMO_TOUR=1
```

Toute autre valeur (ou variable absente) **désactive** l’assistant : aucun lanceur, aucun overlay.

Redémarrer le serveur Next après modification (`npm run dev` / redeploy).

### Usage

1. Ouvrir le site → bouton **Démo guidée** (bas-gauche).
2. Choisir un profil (Visiteur / Contributeur / Admin) ou **Démo complète (présentation)**.
3. Suivre les étapes ; **Quitter** / **Échap** ferme l’assistant.
4. Compte connecté : les sujets admin sont grisés pour un contributeur.

Complémentaire de `ENABLE_DEV_ACCOUNT_SWITCHER` (switch de comptes) — les deux peuvent coexister.

### Contenu démo

Réutiliser les comptes seed / DevAccountSwitcher. Mode **Remplir pour moi** sur les étapes de saisie (titre « Article tutoriel », etc.). Ne pas committer de mots de passe réels.

Conception des parcours : `docs/tutoriel-interactif-demo.md`. Playbook agent : `docs/agent-assistant-demo-etapes.md`.

---

## Contenu à compléter manuellement

Ces éléments ne peuvent pas être entièrement automatisés :

1. **PDF existants** — uploader via Admin → Documents depuis les dossiers projets
2. **Images de couverture** — uploader via l'éditeur d'articles (Cloudinary)
3. **Logo officiel** — remplacer `public/logo-meeed.svg` par le PNG du site actuel
4. **Email contact** — vérifier que `contact@meeed.fr` dans `src/lib/content/site.ts` est correct
5. **Vidéos HelloAsso** — liens déjà présents sur la page Projets (tracteur)

---

*Dernière mise à jour : Phase 9 — finitions & migration.*
