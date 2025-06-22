import HeaderComponent from "./components/HeaderComponent"
import ListEmployeeComponent from './components/ListEmployeeComponent'
import FooterComponent from "./components/FooterComponent"
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import EmployeeComponent from './components/EmployeeComponent'
import 'bootstrap/dist/css/bootstrap.min.css'
import "./App.css"



function App() {

  return (
   <>
    <BrowserRouter>
     <HeaderComponent />
       <Routes>
        <Route path='/' element = {<ListEmployeeComponent />}></Route>
        <Route path='/employees' element = {<ListEmployeeComponent />}></Route>
        <Route path='/add-employee' element = {<EmployeeComponent />}></Route>
        {/* // http://localhost:3000/edit-employee/1 */}
        <Route path='/edit-employee/:id' element = { <EmployeeComponent />}></Route>
       </Routes>
      <FooterComponent />
     </BrowserRouter>
   </>
  )
}

export default App
