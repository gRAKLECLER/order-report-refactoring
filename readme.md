# Order Report – Refactoring

Ce projet consiste à **refactorer un code legacy** produisant des rapports de commandes, pour améliorer **la lisibilité, la maintenabilité et la robustesse**, en appliquant des principes de **programmation fonctionnelle, typage strict et clean code**.

---

## 1. Installation

### Prérequis

* **Node.js** ≥ 18
* **Yarn** ≥ 1.x

Le projet utilise TypeScript, Jest pour les tests et ESLint/Prettier pour le linting.

---

### Cloner le dépôt

```bash
git clone https://github.com/gRAKLECLER/order-report-refactoring
cd order-report-refactoring
```

---

### Installer les dépendances

```bash
yarn
yarn install
```

---

## 2. Exécution

### Scripts disponibles

| Script            | Description                                   |
| ----------------- | --------------------------------------------- |
| `yarn test`       | Lancer tous les tests Jest                    |
| `yarn test:watch` | Lancer les tests en mode watch                |
| `yarn lint`       | Vérifier le code avec ESLint                  |
| `yarn lint:fix`   | Corriger automatiquement les problèmes ESLint |

> ⚠️ Vérifiez que vos scripts correspondent au fichier `package.json`.

---

## 3. Choix de Refactoring

### Problèmes Identifiés dans le Legacy

    1. **Code mort (fonctions et constantes inutilisées)**

   * Impact : confusion pour les futurs développeurs.

    2. **Fonction `run()` monolithique**

   * Impact : code difficile à tester et à maintenir.

    3. **Parsing CSV dupliqué plusieurs fois**

   * Impact : duplication de code, bugs potentiels.

    4. **Absence de typage (`any`)**

   * Impact : impossible de raisonner sur les données, aucun filet de sécurité.

---

### Solutions Apportées

    1. **Suppression du code mort**

   * Nettoyage des constantes et fonctions inutilisées
   * Justification : simplifie la lecture et réduit la futur dette

    2. **Découpage en fonctions pures**

   * Une fonction
   * Pas d’effets de bord
   * Justification : facilite la testabilité et la maintenabilité

    3. **Fonction générique de lecture CSV**

   * Centralisation du parsing dans une fonction réutilisable

```ts
function readCsv<T>(
  filePath: string,
  mapper: (row: string[]) => T
): T[] {
  return fs
    .readFileSync(filePath, 'utf-8')
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map(line => mapper(line.split(',')));
}
```

4. **Typage explicite et données immuables**

   * Utilisation de types clairs (`Order`, `Customer`, etc.)
   * Facilite la compréhension et réduit les erreurs

---

### Architecture Choisie

Le code est organisé par **responsabilité métier** :

* `types.ts` : définition des types (`Order`, `Product`, `Customer`)
* `utils/` : fonctions utilitaires réutilisables
* `tests/` : tests unitaires avec Jest

---

### Exemples Concrets de Refactoring

#### Exemple 1 : Parsing CSV

* **Problème** : logique répétée dans plusieurs fichiers
* **Solution** : fonction générique `readCsv<T>` pour centraliser et typiser

#### Exemple 2 : Calcul des points fidélité

* **Problème** : logique métier mêlée au run
* **Solution** : fonction pure dédiée

```ts
function calculateLoyaltyPoints(orders: Order[], loyaltyRatio: number): Record<string, number> {
    return orders.reduce((acc, o) => {
      acc[o.customerId] = (acc[o.customerId] ?? 0) + o.qty * o.unitPrice * loyaltyRatio;
      return acc;
    }, {} as Record<string, number>);
  }
```

---

## 4. Limites et Améliorations Futures

### Ce qui n’a pas été fait (manque de temps)

* Tests unitaires exhaustifs sur toutes les fonctions utilitaires
* Validation stricte des formats CSV
* Gestion complète du linting et des hooks Git avant commit (ESLint + Prettier + Husky)

---

### Pistes d’Amélioration Future

* Ajout de tests unitaires plus complets
* Validation stricte des données via un schéma
* Mise en place complète de Husky + lint-staged pour garantir le linting et le formatage avant chaque commit

### Compromis Assumés

* Pas de framework de test supplémentaire pour limiter la complexité
* Pas de framework et utilisation stricte de typescript

---
