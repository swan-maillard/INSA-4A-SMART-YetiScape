import { defineStore } from "pinia";
import useAuth from "./auth.store";
import axios from "axios";

// URL du serveur auquel faire les appels API
const API_URL = "http://localhost:3000";

// Nombre maximum de requêtes à effectuer en cas d'erreur
const FAULT_TOLERANCE_MAX_REQUESTS = 3;

// Définition du store api
const useApi = defineStore("api", {
  getters: {
    apiUrl: () => API_URL,
    headers: () => {
      const { token } = useAuth();
      return token
        ? {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          }
        : {
            "Content-Type": "application/json",
          };
    },
  },
  actions: {
    // Effectue une requête GET
    async get(endpoint, params = {}, countRequest = 1) {
      return axios
        .get(this.apiUrl + endpoint, { headers: this.headers, params })
        .catch(async (reason) => {
          if (checkFaultTolerance(reason, countRequest)) {
            // Si checkFauktTolerance est positif, re-effectue la requête en incrémentant countRequest
            return this.get(endpoint, params, countRequest + 1);
          }

          // Rejeter la Promise pour pouvoir être traité par l'appelant
          return Promise.reject(reason);
        });
    },
    // Effectue une requête POST
    async post(endpoint, params = {}, countRequest = 1) {
      return axios
        .post(this.apiUrl + endpoint, params, { headers: this.headers })
        .catch(async (reason) => {
          if (checkFaultTolerance(reason, countRequest)) {
            // Si checkFauktTolerance est positif, re-effectue la requête en incrémentant countRequest
            return this.post(endpoint, params, countRequest + 1);
          }

          // Rejeter la Promise pour pouvoir être traité par l'appelant

          return Promise.reject(reason);
        });
    },
  },
});

/*
 * Vérifie qu'il est possible de re-effectuer la requête
 * Si le seuil max de requête n'a pas été dépassé et si le stats de la réponse est 500
 */
const checkFaultTolerance = (reason, countRequest) => {
  return (
    countRequest < FAULT_TOLERANCE_MAX_REQUESTS &&
    reason.response &&
    reason.response.status === 500
  );
};

export default useApi;
