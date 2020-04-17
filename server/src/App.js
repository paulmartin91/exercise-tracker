import React from 'react';
import './App.css';

//uncomment for local dev
//const server = 'http://localhost:3001'

//uncomment for glitch dev
const server = 'https://historical-chill-reason.glitch.me/'

class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      //Output
      userName: '',
      userID: '',
      usernameIsValid: true,
      exerciseAdded: false,
      //Create User
      createUserUsernameInput: '',
      //Add Exercise
      addExUserIdInput: '',
      addExDescriptionInput: '',
      addExDurationInput: '',
      addExDateInput: '',
      //Get Exersice
      getExUserIdInput: '',
      getExFromInput: '',
      getExToInput: '',
      getExLimitInput: '',
    }
  }


  //Update States
  handleChange = event => this.setState({[event.target.id]: event.target.value})

  handleClick = (event) => {

    //Create User
    if (event.target.id === 'createUser') {
      //get response from API
      fetch( server+'/api/exercise/new-user'+this.state.createUserUsernameInput)
      //convert response to JSON
      .then( async response => response.json())
      //update state with username validity / username
      .then( data =>{
        console.log(data)
        data.usernameExists ? 
          this.setState({ usernameIsValid: false })
        :
          this.setState({ usernameIsValid: true, userName: data.name, userID: data._id })
        })
    }

  //add Exercise
  if (event.target.id === 'addExercise') {
    console.log('add')
    let exerciseToAdd = {
      _id: this.state.addExUserIdInput,
      description: this.state.addExDescriptionInput,
      duration: this.state.addExDurationInput,
      date: this.state.addExDateInput
    }
    fetch(`${server}/api/exercise/add`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(exerciseToAdd)
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) console.log(data)
      else {
        this.setState({
          exerciseAdded: true
        })
      }
    })
  }

    //Get Exercise
    if (event.target.id === 'getExercise') {
      fetch(`${server}/api/exercise/log?id=${this.state.getExUserIdInput}&from=${this.state.getExFromInput}&to=${this.state.getExToInput}&limit=${this.state.getExLimitInput}`)
      .then(response => response.json())
      .then(data => {
        console.log(data)
      })
    }
  }

  render(){
    return (
      <section>

        <div> {/* Create User */}
          <input id="createUserUsernameInput" onChange={this.handleChange} placeholder="Enter new username"></input> <br />
          <button id='createUser' onClick = {this.handleClick}>Log User</button>
          {!this.state.usernameIsValid ? "Username is Invalid" : this.state.userName.length > 0 ?
              <p>New user created... <br />
              User: {this.state.userName} <br />
              User ID: {this.state.userID}
              </p> : ''
          }
        </div><br />
        
        <div> {/* Add Exercise */}
          <input id="addExUserIdInput" onChange={this.handleChange} placeholder="User ID"></input><br />
          <input id="addExDescriptionInput" onChange={this.handleChange} placeholder="Description"></input><br />
          <input id="addExDurationInput" onChange={this.handleChange} placeholder="Duration (mins)"></input><br />
          <input id="addExDateInput" onChange={this.handleChange} placeholder="Date (yyyy-mm-dd)"></input><br />
          <button id='addExercise' onClick = {this.handleClick}>Submit Exercise</button><br />
          {this.state.exerciseAdded && "Exercise Added"}
        </div><br />

        <div> {/* Get exercise */}
          <input id="getExUserIdInput" onChange={this.handleChange} placeholder="User ID"></input><br />
          <input id="getExFromInput" onChange={this.handleChange} placeholder="From"></input>
          <input id="getExToInput" onChange={this.handleChange} placeholder="To"></input><br />
          <input id="getExLimitInput" onChange={this.handleChange} placeholder="Limit"></input><br />
          <button id='getExercise' onClick = {this.handleClick}>Get Exercise</button><br />
        </div>

      </section>
    );
  }
}

export default App;
