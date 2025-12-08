# SAE-S5-BUT3-IoT-G1

## Comment lancer le docker-compose.yml 

```
docker compose build       
docker compose up -d
puis se rendre sur http://localhost:8080
```

Pour tout rénitialiser avec les volumes :

```
docker compose down -v    # supprime les anciens volumes pour réinitialiser
```

Penser à vérifier si les noeuds node-red sont bons au démarrage de l'appli : 
Dans le terminal après avoir up :
```
node-red 
```
Puis se rendre sur http://127.0.0.1:1880/
