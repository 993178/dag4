//dit is een stateful component, ofwel een smart component, ofwel een container component waarin wel een state zit en interne logica
// van deze components wil je er zo min mogelijk

// hier ook de creation lifecycle met welke fase wanneer gebeurt

import React, { Component } from 'react';
import cssImports from './Poes.css';   // okeeeeej, dus... we hebben css-loader geconfigureerd in webpack.config.js, waardoor elke css-class nu als uniek ding wordt opgeslagen en alleen wordt toegepast op het js-bestand waarin je het importeert. Bij Discount Jonas heet dit classes
import Katten from '../components/Katten/Katten'; // namen van componenten etc altijd met hoofdletter, kleine letters zijn voor de html-elementen
import Cockpit from '../components/Cockpit/Cockpit';
//import WithClass from '../hoc/WithClass';  // hoc-methode #1
import withClass from '../hoc/withClass';    // hoc-methode #2
import Aux from '../hoc/Aux';
import AuthContext from '../context/auth-context';

class Poes extends Component {
  state = {   // in oudere versies moet je eerst een constructor(props) toevoegen met daarin een super(props), en dan this.state = blablabla. Deze directere versie is korter en moderner. Maar constructor is dus de eerste lifecycle stap
    cats: [     // id is hier handmatig toegevoegde onzin; een database geeft al zijn elementen zelf wel een id
      { id: 'uyt', name: 'That black one', status: "is a PITA" },
      { id: 'rfc', name: "That light grey tabby", status: "Emma seems to like him" },
      { id: 'poi', name: "Dikkie Dik", status: "is welcome" }
    ],
    ourCat: { name: 'Emma', status: 'murdered a bird today...'},
    catsAreThere: false,
    showCockpit: true,
    counter: 0,
    authenticated: false,
  }

  //static getDerivedStateFromProps(state, props) { return state; }     // zeldzame tweede stap in de lifecycle voor het geval je meteen al moet checken of props en state nog uptodate zijn...
  // componentWillMount             // staat op de nominatie om te verdwijnen
  // componentDidMount() {}         // vijfde en laatste stap in de lifecycle creation fase, is ook om data van server op te halen

  // shouldComponentUpdate >> update lifecycle    voor de performance
  // componentDidUpdate >> update lifecycle!      ook voor serverinteractie

  switchNameHandler = (newInsult) => {  // nu geven we een parameter mee, die ingevuld wordt bij de 'call' in de button, als tweede argument van de bind-methode
    //niet doen: this.state.cats[0].name = 'That $%#$% black one';
    this.setState({cats: [
      { name: newInsult, status: "is a PITA" },
      { name: "That light grey tabby", status: "Emma seems to like him" },
      { name: "Dikkie Dik", status: "we'll pet him if he wants us to" }
    ]})
  }

  toggleCatHandler = () => {                                                   //  blablaHandler() {}    // dit is de andere manier om een methode te schrijven, maar die houdt 'this' vast zodat this niet meer naar de beoogde dingen verwijst
    const catsThere = this.state.catsAreThere;
    this.setState({catsAreThere: !catsThere});
  }

  typeNameHandler = (event, id) => {
    const catIndex = this.state.cats.findIndex(c => {    // right, dus we zoeken eerst de juiste kat met de id-parameter
      return c.id === id;
    })

    const cat = {...this.state.cats[catIndex]};   // object met spread operater om te kopiëren en niet te muteren.   //const cat = Object.assign({}, this.state.cats[catIndex])    // oudere manier van kopiëren
    cat.name = event.target.value
    const cats = [...this.state.cats];
    cats[catIndex] = cat;

    // this.setState({    // als je geen vorige versies nodig hebt, is setState met alleen een object prima 
    //   cats: cats, 
    //   counter: this.state.counter +1  // FOUT  In zo'n klein appje als dit werkt het wel, maar in een grote app kun je er niet op rekenen dat zo'n state.counter écht de meest recente vorige versie was, de app kan elders tegelijkertijd ook aan het setStaten zijn, waardoor deze state.counter niet de laatste versie is (en counter dus niet genoeg erbij telt)
    // })

    this.setState((prevState, props) => {   // als je wél vorige versies nodig hebt, gooi je er een functie in, met vorigeversie en props als argumenten
      return {
        cats: cats,
        counter: prevState.counter +1
      };
    });
  }

  shooAwayHandler = (el) => {
    const cats = [...this.state.cats]  // optie 2 met spread operator; dit is ook een kopie (shallow geloof ik? hoe zat het ook alweer)   //const cats = this.state.cats.slice();  // slice zonder selectiecriterium kopieert de originele data zodat die niet muteert; belangrijk in grotere apps
    cats.splice(el, 1);
    this.setState({cats: cats});
  }

  loginHandler = () => {
    this.setState({authenticated: true})
  }

  render() {    // derde lifecycle-stap
    let cats = null;    // optie 2 van conditionele elementen: je maakt een variabele die je rendert, en verandert die hier evt met een if

    if (this.state.catsAreThere) {    // optie 2 conditioneel renderen
      cats = <Katten 
            cats={this.state.cats} 
            shoo={this.shooAwayHandler} 
            typed={this.typeNameHandler}
            isAuthenticated={this.state.authenticated} />;
    }

    return (
        //<WithClass cssstuff={cssImports.Poes}>   // Methode #1 voor een hoc: waarbij het te returnen component wordt gewrapt met de hoc
        <Aux>
          <button 
            onClick={() => {
              this.setState({showCockpit: false})
              }} >
              Remove cockpit
          </button> {/* quick and dirty manier om even een functie erin te gooien */}

          <AuthContext.Provider value={{authenticated: this.state.authenticated, login: this.loginHandler}} /* deze wrap je om de componenten die er toegang toe nodig hebben, in dit geval Cockpit en  */ >
            {this.state.showCockpit ? <Cockpit                        // child components renderen is de vierde lifecycle-stap
              title={this.props.boventitel} // this omdat het een class is, props omdat deze dus bij index.js vandaan komt - weer een niveau hoger!
              catsAreThere={this.state.catsAreThere} 
              //cats={this.state.cats}      // oude versie, niet zo specifiek
              catsLength={this.state.cats.length}   // nieuwe specifieke versie, zodat de gememode Cockpit alleen wordt gererenderd als length verandert, niet als er iets anders in cats verandert
              toggleCatHandler={this.toggleCatHandler} 
              /> : null}
            {cats}
          </AuthContext.Provider>
        </Aux>
        // Methode #2 voor hoc is met Aux, en dan...
        //</WithClass>
    );
  }
}

//export default Poes;    // hoc-methode #1
export default withClass(Poes, cssImports.Poes);  // hoc-methode #2




// even uit de weg parkeren:

// import Radium, { StyleRoot } from 'radium';
// in const style:
// ':hover': {       // dankzij Radium kunnen we nu ook pseudo-selectors op een inline manier aanpassen (anders zorgt de : voor problemen)(alsof hover ook nog iets anders is in css, zonder :...)
//   backgroundColor: 'lightgreen',
//   color: 'black'
// }
// // onder baccol red voor de voorwaardelijke opmaak vd button
// style[':hover'] = {
//   backgroundColor: 'lightcoral',
//   color: 'black'
// }



// return (        // wrap your root/app in StyleRoot, anders werken de inline media queries niet en stel je vóór dat je die netjes en overzichtelijk in een separated of concerns css-bestand moet zetten
//   <StyleRoot>
//     <div className="Poes">
//       <h1 className={classes.join(' ')} >Pretend this is the yard...</h1>
//       <button style={style} onClick={this.toggleCatHandler}>To cat or not to cat</button>
//       {cats}
//     </div>
//   </StyleRoot>
// );
// }
// }

// export default Radium(Poes);






/////////////////////////

// if (this.state.catsAreThere) {    // optie 2 conditioneel renderen
//   cats = (
//     <div>
//       {this.state.cats.map((cat, index) => {
//         return <Kat key={cat.id}
//                   name={cat.name} 
//                   status={cat.status} 
//                   klik={() => this.shooAwayHandler(index)}
//                   tik={(event) => this.typeNameHandler(event, cat.id)}  />
//       })}

//       {/* <Kat name={this.state.cats[0].name} status={this.state.cats[0].status}>We've had to chase him out of the yard so Em could go take a dump</Kat>
//       <Kat 
//         name={this.state.cats[1].name} 
//         status={this.state.cats[1].status}
//         tik={this.typeNameHandler}
//         // klik={this.switchNameHandler.bind(this, 'That black shitcat')}
//         klik={this.shooAwayHandler} />  
//               {/* ^functie doorgeven als prop */}
//       {/* <Kat name={this.state.cats[2].name} status={this.state.cats[2].status} /> */}
//     </div>
//   );
//   style.backgroundColor = 'red';
// }


// dito
// return (
//   <div className="Poes">
//     {/* <button style={style} onClick={() => this.switchNameHandler('That $%*&^ black one')}>Switch name</button> */}
//       {/* ^methode-als-prop doorgeven met arrowfunctie ipv bind, met argument in de call. Blijkbaar re-rendert React dit ook weleens onnodig, dus het is niet de voorkeursmethode */}
//           {/* ^^style en niet this.style omdat ie gewoon in deze zelfde functie staat */}
//     <h1>Pretend this is the yard...</h1>
//     <button style={style} onClick={this.toggleCatHandler}>To cat or not to cat</button>
//     {/* { this.state.catsAreThere ? //zootje JSX// : null } */}
//         {/* ^dit is 1 optie om elementen conditioneel te renderen: zet het hele element IN een ternary operator (binnen {}!) */}
//     {cats}
//   </div>
// );









// React hook versie
// hierin heb je niet een groot state object, maar eerder verschillende specifieke stukjes met ieder hun eigen setmethode (althans dat zit standaard in useState)
// import React, { useState } from 'react';
// import './Poes.css';
// import Kat from './Kat/Kat'; // namen van componenten etc altijd met hoofdletter, kleine letters zijn voor de html-elementen

// const poes = props => {
//   const [ catState, setCatState ] = useState({      // is altijd een array (?? zie ik niet) met 2 elementen: de state zoals je die in class-based componenten hebt (dit is een functional component), en......
//     cats: [
//       { name: 'That black one', status: "is a PITA" },
//       { name: "That light grey tabby", status: "Emma seems to like him" },
//       { name: "Dikkie Dik", status: "is welcome" }
//     ]
//     //, ourCat: {{ name: 'Emma', status: 'murdered a bird today...'}}   // optie 1; bij 1 grote staat
//   });

//   const [ ourCat, setOurCat ] = useState({ourCat: { name: 'Emma', status: 'murdered a bird today...'}})   // optie 2 om deze info te behouden bij een setState: meerdere useStates

//   const switchNameHandler = () => {           // deze functie is kennelijk het tweede ding in de array van useState?? Vage shit
//     //console.log('don\'t you EVER click me again you bastard');
//     //niet doen: this.state.cats[0].name = 'That $%#$% black one';
//     setCatState({cats: [                                      // BELANGRIJK verschil met class components: deze functie mergt NIET. Alles wat je hier in setState flikkert aan nieuwe data, is voortaan ook de enige data. Wil je de andere dingen ook behouden, dan moet je die hierin kopiëren
//       { name: 'That $%*&^ black one', status: "is a PITA" },
//       { name: "That light grey tabby", status: "Emma seems to like him" },
//       { name: "Dikkie Dik", status: "we'll pet him if he wants us to" }
//     ],
//     //ourCat: catState.ourCat     // optie 1 om deze info te behouden bij setState-acties: herhalen in de setmethode
//   });

//     return (
//       <div className="Poes">
//         <button onClick={switchNameHandler}>Switch name</button>
//         <Kat name={catState.cats[0].name} status={catState.cats[0].status}>We've had to chase him out of the yard so Em could go take a dump</Kat>
//         <Kat name={catState.cats[1].name} status={catState.cats[1].status} />
//         <Kat name={catState.cats[2].name} status={catState.cats[2].status} />        
//       </div>
//     );
// }};

// export default poes;


// versie met errorboundary: 

// import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

// //in render:
// if (this.state.catsAreThere) {    // optie 2 conditioneel renderen
//   cats = (
//     <div>
//       {this.state.cats.map((cat, index) => {    // Errorb is een higher order component, maar dat betekent ook dat dit nu het buitenste element is dat de .mapmethode aanpakt van die Kat-elementen, dus moet de id op ErrorB en niet meer op Kat.
//         return <ErrorBoundary key={cat.id}>
//                 <Kat
//                   name={cat.name} 
//                   status={cat.status} 
//                   klik={() => this.shooAwayHandler(index)}
//                   tik={(event) => this.typeNameHandler(event, cat.id)}  />
//                </ ErrorBoundary> // Discount Jonas: gebruik zo'n error boundary voor componenten die met een server communiceren oid, met redelijke kans dat dat niet lukt
//       })}
//     </div>
//   );
//   btnClass = cssImports.Red;  // cssloader geeft ons een string
// }
