import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { listEmployees, deleteEmployee } from "../services/EmployeeService";


const ListEmployeeComponent = () => {
    const [employees, setEmployees] = useState([])

    const navigator = useNavigate();

    useEffect(() => {
        getAllEmployees()
    }, [])
    
    function getAllEmployees() {
        listEmployees().then((response) => {
            setEmployees(response.data);
        }).catch(error => {
            console.error(error);
        })
    }
    
    function backToList() {
        navigator('/employees')
    }

    function addNewEmployee(){
        navigator('/add-employee')
    }

    function updateEmployee(id) {
        navigator(`/edit-employee/${id}`)
    }

    function removeEmployee(id) {
        console.log(id)

        deleteEmployee(id)
        .then((response) =>{
            getAllEmployees()
        }).catch(error => {
            console.error("删除员工失败:",error);
        })
    }

        return (
            <div className="container">
                <h2 className="text-center" onClick={backToList}>List of Employees</h2>
                <button className="btn btn-primary mb-2" onClick={addNewEmployee}>Add Employee</button>
                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>ID</th> 
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            employees.map(employee => 
                                <tr key={employee.id}>
                                    <td>{employee.id}</td>
                                    <td>{employee.name}</td>
                                    <td>{employee.phone}</td>
                                    <td>{employee.email}</td>
                                    <td>
                                        <button className="btn btn-info" onClick={() => updateEmployee(employee.id)}>Update</button>
                                        <button className="btn btn-danger ms-2" onClick={() => removeEmployee(employee.id)}>Delete</button>
                                    </td>            
                                </tr>
                            )
                        }
                        <tr></tr>
                    </tbody>
                </table>
            </div>
        )
    }


export default ListEmployeeComponent