import APIService from "./apiService";

class QuestionnaireService extends APIService {
  constructor() {
    super(process.env.REACT_APP_API_BASEURL)
  }

  async getDomains(readinessIndexType) {
    return this.get(`/domain/${readinessIndexType}`)
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error
      })
  }

  async getDimensionById(dimensionId) {
    const request = () => this.get(`/dimension/${dimensionId}`)
    return request()
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        const status = error?.response?.status
        if (status === 500) {
          return request().then((response) => response?.data)
        }
        throw error
      })
  }

  async sendResponse(data) {
    return this.post('/response', data)
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error?.response?.data
      })
  }

  async submitQuestionnaire(data) {
    return this.post('/response/submit', data)
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error?.response?.data
      })
  }

  async viewResponses(companyId, readinessIndexType) {
    return this.get(`/domain-score/${companyId}/${readinessIndexType}`)
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error?.response?.data
      })
  }

  async updateResponses(data) {
    return this.patch('/response/update', data)
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error?.response?.data
      })
  }

}

const questionnaireService = new QuestionnaireService()
export default questionnaireService
