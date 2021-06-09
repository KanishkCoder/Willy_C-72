import React from 'react';
import { Alert, Image, StyleSheet, Text, TextInput ,TouchableOpacity, View, KeyboardAvoidingView, KeyboardAvoidingViewBase, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions'
import {BarCodeScanner} from 'expo-barcode-scanner'
import   firebase from 'firebase'
import db from '../config'


export default class Transaction extends React.Component{
constructor(){
    super();
    this.state={
        hasCameraPermissions:null,
        scanned:false,
        scannedBookId:'',
        scannedStudentId:'',
        buttonState:'normal',
        
    }
}

getCameraPermissions=async(id)=>{
    const{status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
        hasCameraPermissions:status==="granted",
        buttonState:id,
        scanned:false
    })
}
handleBarCodeScanned=async({type,data})=>{
    const {buttonState} = this.state
    if(buttonState==='BookId'){
        this.setState({
            scanned:true,
            scannedBookId:data,
            buttonState:'normal'
        })
    }
    else if(buttonState==='StudentId'){
        this.setState({
            scanned:true,
            scannedStudentId:data,
            buttonState:'normal'
        })
    }
}

initiateBookIssue=async()=>{
    db.collection("Transaction").add({
        "StudentId":this.state.scannedStudentId,
        "BookId":this.state.scannedBookId,
        "date":firebase.firestore.Timestamp.now().toDate(),
        "transactionType":"Issue"
    })
    db.collection("books").doc(this.state.scannedBookId).update({
        "BookAvailability":false
    })
    db.collection("Students").doc(this.state.scannedStudentId).update({
        "NumberOfBookIssued":firebase.firestore.FieldValue.increment(1)
    })
    Alert.alert("Book Issued!")
    this.setState({
        scannedBookId:'',
        scannedStudentId:''
    })
}
initiateBookReturn=async()=>{
    db.collection("Transaction").add({
        "StudentId":this.state.scannedStudentId,
        "BookId":this.state.scannedBookId,
        "date":firebase.firestore.Timestamp.now().toDate(),
        "transactionType":"Return"
    })
    db.collection("books").doc(this.state.scannedBookId).update({
        "BookAvailability":true
    })
    db.collection("Students").doc(this.state.scannedStudentId).update({
        "NumberOfBookIssued":firebase.firestore.FieldValue.increment(-1)
    })
    Alert.alert("Book Issued!")
    this.setState({
        scannedBookId:'',
        scannedStudentId:''
    })
}

handleTransaction=()=>{
    console.log(this.state)
    var transactionMessage
    db.collection("Books").doc(this.state.scannedBookId).get().then((doc)=>{
        console.log(doc.data())
        var book = doc.data()
        if(book.BookAvailability){
            this.initiateBookIssue()
            transactionMessage="Book Issued"
            ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
        }
        else {
            this.initiateBookReturn()
            transactionMessage="Book Returned"
            ToastAndroid.show(transactionMessage, ToastAndroid.SHORT)
        }
    })
    this.setState({
        transactionMessage:transactionMessage
    })
}

    render(){
        const hasCameraPermissions=this.state.hasCameraPermissions;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;
        if(buttonState !== 'normal' && hasCameraPermissions){
            return(
                <BarCodeScanner 
                onBarcodeScanned={scanned ? undefined: this.handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
                />
            )
        }else if(buttonState==='normal'){
            return(
                <KeyboardAvoidingView style={styles.container} behavior="padding" enabled >
                    <View>
                        <Image 
                        source={require("C:/Users/Kanishk/Documents/Class_68/assets/booklogo.jpg")}
                        style={{width:200,height:200}}
                        />
                        <Text style={{textAlign:'center',fontSize:30}} >Willy</Text>
                    </View>
                    <View style = {styles.inputView} >
                        <TextInput style={styles.inputBox}onChangeText={(text) => {
                this.setState({
                    scannedBookId: text,
                });
              }} placeholder="Book ID"/>
                        <TouchableOpacity style={styles.scanButton} 
                        onPress={()=>{this.getCameraPermissions("BookId")}}
                        >
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                        </View>
                    <View style = {styles.inputView} >
                        <TextInput style={styles.inputBox}onChangeText={(text) => {
                this.setState({
                    scannedStudentId: text,
                });
              }} placeholder="Student ID" />
                        <TouchableOpacity style={styles.scanButton} 
                        onPress={()=>{this.getCameraPermissions("StudentId")}}
                        >
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.submitButton}
                        onPress={async()=>{
                            this.handleTransaction()
                            this.setState({
                                scannedBookId:"",
                                scannedStudentId:""
                            })
                        }} >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
            </KeyboardAvoidingView>
                
            )
        }
    }
        }
        


const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center' ,
        alignSelf:'center',
    },
    displayText:{
        fontSize:15,
        textDecorationLine:'underline',
    },
    scanButton:{
        backgroundColor:'yellow',
        width:60,
        borderWidth:1.5,
        borderLeftWidth:0,
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop:10,
    },
    inputView:{
        flexDirection:'row',
        margin:20,
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    submitButton:{
        backgroundColor:"yellow",
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white'
    }
})