import {useEffect, useRef, useState} from 'react'
import { createEmployee, updateEmployee, getEmployee } from '../services/service'
import { useNavigate, useParams} from 'react-router-dom'

function EmployeeComponent() {

    const formRef = useRef(null);
    const [defaults, setDefaults] = useState({
        name: '',
        phone: '',
        email: ''
    })

    const {id} =useParams();

    const navigator = useNavigate();

    useEffect(() => {
        if(id) {
            getEmployee(id).then((response) => {
                setDefaults({
                    name: response.data.name ?? '',
                    phone: response.data.phone ?? '',
                    email: response.data.email ?? ''
                });
            }).catch(error => {
                console.error(error);
            })
        } else {
            setDefaults({
                name: '',
                phone: '',
                email: ''
            })
        }
    }, [id])

    function saveEmployee(e) {
        e.preventDefault();

        if(!formRef.current) return;
        const formData = new FormData(formRef.current);
        const employee = Object.fromEntries(formData.entries());
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
                    <form ref={formRef} key={id || 'new'}>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Name</label>
                            <input
                              type='text'
                              placeholder='Enter employee name'
                              name='name'
                              defaultValue={defaults.name}
                              className='form-control'
                              required
                            >
                            </input>
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Phone</label>
                            <input
                              type='text'
                              placeholder="Enter employee's phone number"
                              name='phone'
                              defaultValue={defaults.phone}
                              className='form-control'
                              required
                            >
                            </input>
                        </div>
                        <div className='form-group mb-2'>
                            <label className='form-label'>Email</label>
                            <input
                              type='text'
                              placeholder="Enter employee's email"
                              name='email'
                              defaultValue={defaults.email}
                              className='form-control'
                              required
                            >
                            </input>
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