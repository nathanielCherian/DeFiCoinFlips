import React from 'react';
import './App.css';
import TestContract from './labs/Contract';

export default class App extends React.Component{

  render(){
    return (
      <div>
        <h1>Hello there</h1>

        <TestContract/>
      </div>
    );
  }

}
