import axios from "axios";

const REST_API_BASE_URL = "/api/employees";

export const listEmployees = () => axios.get(REST_API_BASE_URL);

export const createEmployee = (employee: any) =>
  axios.post(REST_API_BASE_URL, employee);

export const getEmployee = (employeeId: string) =>
  axios.get(`${REST_API_BASE_URL}/${employeeId}`);

export const updateEmployee = (employeeId: string, employee: any) =>
  axios.put(`${REST_API_BASE_URL}/${employeeId}`, employee);

export const deleteEmployee = (employeeId: string) =>
  axios.delete(`${REST_API_BASE_URL}/${employeeId}`);
