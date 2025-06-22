import {useEffect, useState} from 'react'
import { createEmployee, updateEmployee, getEmployee } from '../services/EmployeeService'
import { useNavigate, useParams} from 'react-router-dom'

function EmployeeComponent() {

    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')

    const {id} =useParams();

    const [errors, setErrors] = useState({
        name: '', phone: '', email: ''
    })
    
    function handelName(e) {
        setName(e.target.value)
    }

    function handelPhone(e) {
        setPhone(e.target.value)
    }

    function handelEmail(e) {
        setEmail(e.target.value)
    }

    const navigator = useNavigate();

    useEffect(() => {
        if(id) {
            getEmployee(id).then((response) => {
                setName(response.data.name);
                setPhone(response.data.phone);
                setEmail(response.data.email)
            }).catch(error => {
                console.error(error);
            })
        }
    }, [id])

    function saveEmployee(e) {
        e.preventDefault();

        if(validateForm()) {
            const employee = {name, phone, email}
            console.log(employee)

            if(id) {
                updateEmployee(id, employee).then((response) => {
                    console.log(response.data);
                    navigator('/employees')
                }).catch(error => {
                    console.error(error);
                })
            }else {
                 createEmployee(employee).then((response) => {
            console.log(response.data);
            navigator('/employees')
        }).catch(error => {
            console.error(error);
        })
        }   
        }
           
    }

    function validateForm() {
        let valid = true;
        const errorsCopy = {...errors}

        if(name.trim()) {
            errorsCopy.name = '';
        }else{
            errorsCopy.name = 'name is required.';
            valid = false;
        }

        if(phone.trim()) {
            errorsCopy.phone = '';
        }else{
            errorsCopy.phone = 'phone number is required.';
            valid = false;
        }

        if(email.trim()) {
            errorsCopy.email = '';
        }else{
            errorsCopy.email = 'email is required.';
            valid = false;
        }

        setErrors(errorsCopy);

        return valid;
    }

    function pageTitle() {
        if(id) {
            return <h2 className='text-center'>Update Employee</h2>
        }else {
            return <h2 className='text-center'>New Employee</h2>
        }
    }

    return(
        <div className='container'>
          <div className='row'>
            <div className='card col-md-6'>
                {pageTitle()}
                <div className='card-body'>
                    <form>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Name</label>
                            <input
                              type='text'
                              placeholder='Enter employee name'
                              name='name'
                              value={name}
                              className={`form-control ${errors.name ? 'is-invalid': ''}`}
                              onChange={handelName}
                            >
                            </input>
                            {errors.name && <div className='invalid-feedback'> {errors.name}</div>}  
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Phone</label>
                            <input
                              type='text'
                              placeholder="Enter employee's phone number"
                              name='phone'
                              value={phone}
                              className={`form-control ${errors.phone ? 'is-invalid': ''}`}
                              onChange={handelPhone}
                            >
                            </input>
                            {errors.phone && <div className='invalid-feedback'> {errors.phone}</div>}    
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Email</label>
                            <input
                              type='text'
                              placeholder="Enter employee's email"
                              name='email'
                              value={email}
                              className={`form-control ${errors.email ? 'is-invalid': ''}`}
                              onChange={handelEmail}
                            >
                            </input>
                            {errors.email && <div className='invalid-feedback'> {errors.email}</div>}    
                        </div>
                        <button className='btn btn-success' onClick={saveEmployee}>Submit</button>
                    </form>
                </div>
            </div>
          </div>
         
        </div>
    )
}

export default EmployeeComponent