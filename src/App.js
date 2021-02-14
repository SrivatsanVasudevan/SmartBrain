import React from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';

import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

// const initialState = {
//   input: '',
//   imageUrl: '',
//   box: {},
//   route: 'signin',
//   isSignedIn: false,
//   user: {
//     id: '',
//     name: '',
//     email: '',
//     password: '',
//     entries: 0,
//     joined: ''
//   }
// }



const particlesOptions = {
  particles: {
    number: {
      value: 150,
      density: {
        enable: true,
        value_area: 800
      }
    }
  },
  interactivity: {
    detect_on: "window",
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      }
    }
  }
}

class App extends React.Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        password: '',
        entries: 0,
        joined: ''
      }
    };
  }
  
  loadUser = (data) => {
    this.setState({ user: {
        id: data.id,
        name: data.name,
        email: data.email,
        password: data.password,
        entries: data.entries,
        joined: data.joined
      }
    })
  }

  onInputChange = (event) => {
    console.log(event.target.value);
    this.setState({input:event.target.value});
  }

  onSubmitClick = () => {
    this.setState({imageUrl:this.state.input});
    fetch('http://localhost:3000/imageurl',{
          method: 'post',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            input: this.state.input
          })
        })
        .then(response => response.json())
    .then(response => {
      if(response){
        fetch('http://localhost:3000/image',{
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
        .catch(err => {console.log('error in fetching the api')})
        .then(response => response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user, {entries:count}));
        })
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    } 
    )
    .catch(error => console.log(error));
  }

  onRouteChange = (route) => {
    if(route === 'home'){
      this.setState({isSignedIn:true});
    }
    else if(route === 'signout'){
      this.setState({isSignedIn:false,
        input: '',
        imageUrl:'',
        box:{},
        user: {
          id: '',
          name: '',
          email: '',
          password: '',
          entries: 0,
          joined: ''
        }
      });
    }
    this.setState({route:route});
  }

  calculateFaceLocation = (data) => {
    const clarifaiData = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiData.left_col * width,
      topRow: clarifaiData.top_row * height,
      rightCol: width - (clarifaiData.right_col * width),
      bottomRow: height - (clarifaiData.bottom_row * height)

    }
  }

  displayFaceBox = (box) => {
    this.setState({box:box});
  }

  render(){
    return (
      <div className="App">
        <Particles className = "particles" 
          params={particlesOptions}
        />
        <Navigation onRouteChange = {this.onRouteChange} isSignedIn = {this.state.isSignedIn}/>
        { this.state.route === 'home' ?
          <div>
            <Logo />
            <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
            <ImageLinkForm onInputChange = {this.onInputChange} onSubmitClick = {this.onSubmitClick} />
            <FaceRecognition imageUrl = {this.state.imageUrl} box = {this.state.box}/>
        </div>
          : (
            this.state.route === 'signin' ? <SignIn loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
            : <Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
          )
          
        }
      </div>
    );
  }
  
}

export default App;
