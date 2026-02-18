import APIService from "./apiService";

class ConsultantService extends APIService {
  constructor() {
    super(process.env.REACT_APP_API_BASEURL)
  }

  async createConsultant(data) {
    const { email, password, confirmPassword, userName } = data
    return this.post("/consultant/create", { email, password, confirmPassword, userName })
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error?.response?.data
      });
  }

  async getAllConsultants() {
    return this.get('/consultant/all')
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        throw error?.response?.data
      })
  }

  async getConsultantById(consultantId) {
    return this.get(`/consultant/${consultantId}`)
      .then((response) => {
        return response?.data
      })
      .catch((error) => {
        return error?.response?.data
      })
  }
}

const consultantService = new ConsultantService()
export default consultantService