#include <LiquidCrystal_I2C.h>
#include <Adafruit_Fingerprint.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>


LiquidCrystal_I2C dis(0x27, 16, 2);
SoftwareSerial mySerial(0, 2); // TX/RX
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

uint8_t id;
String now;
int epa;
String epass="";
int i;
int statusCode;
const char *ssid ="BENG20ETE";
const char *pass ="JacobTz04";
String st;
String content;
String category;
bool testWifi(void);
void launchWeb();
void setupAP(void);
void sendDataz(int x, int no);
void createWebServer();
int readnumber();
uint8_t getFingerprintEnroll();
ESP8266WebServer server(80);

String fname="";
String lname="";
String cart="";
String reg="";
const String host = "192.168.255.40:4321";

int port=80;


void setup() {
  Serial.begin(9600);
  dis.init();
  dis.backlight();
   dis.setCursor(0, 0);
  dis.print("WELCOME TO....");
  dis.setCursor(0,1);
  dis.print("ATTENDANCE SYST");
  delay(2500);
  dis.clear();
  dis.setCursor(0, 0);
  dis.print("ATTENDANCE SYST");
  dis.setCursor(0,1);
  dis.print("Initializing");

  delay(1000);
  
  while (!Serial);  // For Yun/Leo/Micro/Zero/...
  delay(100);
  Serial.println("\n\nAdafruit Fingerprint sensor enrollment");

  // set the data rate for the sensor serial port
  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) {
      delay(1);
    }
  }
  
   WiFi.disconnect();
  delay(1000);
 
  WiFi.mode(WIFI_OFF);        //Prevents reconnection issue (taking too long to connect)
  delay(1000);
  WiFi.mode(WIFI_STA);        //This line hides the viewing of ESP as wifi hotspot
  
  WiFi.begin(ssid, pass);     //Connect to your WiFi router
  Serial.println("");
   dis.clear();
  dis.setCursor(0, 0);
  dis.print("ATTENDANCE SYST");
  dis.setCursor(0, 1);
  dis.print("Connecting.....");
  Serial.print("Connecting");
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  //If connection successful show IP address in serial monitor
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());  //IP address assigned to your ESP
  
  dis.setCursor(0, 0);
  dis.print("ATTENDANCE SYST");
  dis.setCursor(0, 1);
  dis.print(WiFi.localIP());
  
EEPROM.begin(512);
delay(10);
Serial.println();
 

  launchWeb();
  server.begin();
  dis.setCursor(0,0);
  
  dis.clear();
  

  finger.getParameters();
}

int readnumber(){

String epas;
for(int i =0; i<4; ++i){
  epas+=char(EEPROM.read(i));
}
int pa=epas.toInt();
return pa+1;
}


void   addid(int D){
 Serial.println("in Here");
 int k=D;
 String y=String(k);
 for(int i=0; i<4; ++i){
      EEPROM.write(i,y[i]);
      EEPROM.commit();    
}

dis.setCursor(0,0);
dis.print("ATTENDACE SYS");

}

void loop() { // run over and over again

  int id=0;
  dis.setCursor(0, 0);
  dis.print("Place finger");
  id = readnumber();
  if (id == 0) {// ID #0 not allowed, try again!
    return;
  }
//  Serial.print("Enrolling ID #");
//  Serial.println(id);


  
  server.handleClient();
   id=getFingerprintID();

  if(id!=0){
    sendDataz(String(id));
  }
  
}


void sendDataz(String id)
{
     dis.setCursor(0,0);
     dis.print("sending to Server");
     
 Serial.print("connecting to ");
  Serial.println(host);

  // Use WiFiClient class to create TCP connections
  WiFiClient client;
  HTTPClient http;
  
  const int httpPort = 4321; // 80 is for HTTP / 443 is for HTTPS!

   http.begin(client, "http://"+host+"/submit-fingerprint"); //HTTP
  // http.addHeader("API_KEY", "f546a52c-1581-4ce3-9663-e60df5a3ca23");
   http.addHeader("Content-Type", "application/json");
 // client.setInsecure(); // this is the magical line that makes everything work
  


  // We now create a URI for the request
  String url = "submit-fingerprint";



  Serial.print("Requesting URL: ");
  Serial.println(url);

  // This will send the request to the server
//
  String PostData = "{\"fingerprintData\":\""+id+"\"}";
 Serial.println(PostData);
int httpCode = http.POST(PostData);
 String response;
  if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);

      // file found at server
    if (httpCode == HTTP_CODE_OK) {
      const String& payload = http.getString();
      Serial.println("received payload:\n<<");
      Serial.println(payload);
      response=payload;
      Serial.println(">>");
  dis.setCursor(0, 1);
  dis.print("Accepted...... ");
    delay(2000);
  dis.clear();
      delay(2000);
      }
      else if(httpCode==404||httpCode==500){

      delay(2000);
      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
dis.setCursor(0, 1);
  dis.print("check PC IP ADD");
    delay(2000);
  dis.clear();
      delay(2000);

      delay(2000);
    }

    http.end();



  Serial.println();
  Serial.println("closing connection");

  dis.clear();

}





uint8_t getFingerprintEnroll() {

  int p = -1;
  Serial.print("Waiting for valid finger to enroll as #"); Serial.println(reg.toInt());
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        //Serial.println(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }
  }

  // OK success!

  p = finger.image2Tz(1);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
        dis.setCursor(0, 1);
  dis.print("Not found      ");
  delay(2000);
  dis.clear();
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      dis.setCursor(0, 1);
  dis.print("Accepted...... ");
    delay(2000);
      return p;
  }

  Serial.println("Remove finger");
  dis.setCursor(0,1);
  dis.print("Remove finger   ");
  delay(2000);
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }
  Serial.print("ID "); Serial.println(reg.toInt());
  p = -1;
  Serial.println("Place same finger again");

  dis.setCursor(0,1);
  dis.print("Put finger Again ");
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        //Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        dis.setCursor(0, 1);
  dis.print("Accepted...... ");
    delay(2000);
        break;
    }
  }

  // OK success!

  p = finger.image2Tz(2);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      dis.setCursor(0,1);
    dis.print("Rejected");
    delay(2000);
  dis.clear();
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  }

  // OK converted!
  Serial.print("Creating model for #");  Serial.println(reg.toInt());

  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Fingerprints did not match");
    return p;
  } else {
    Serial.println("Unknown error");
    return p;
  }

  Serial.print("ID "); Serial.println(reg.toInt());
  dis.setCursor(0, 1);
  dis.print("Fingerprint");

  p = finger.storeModel(reg.toInt());
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
    dis.print(" Stored!");
    addid(id);
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("Could not store in that location");
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("Error writing to flash");
    return p;
  } else {
    Serial.println("Unknown error");
    return p;
  }

  return true;
}


//READ FINGER//

uint8_t getFingerprintID() {
  uint8_t p = finger.getImage();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image taken");
      break;
    case FINGERPRINT_NOFINGER:
      Serial.println("No finger detected");
      return 0;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return 0;
    case FINGERPRINT_IMAGEFAIL:
      Serial.println("Imaging error");
      return 0;
    default:
      Serial.println("Unknown error");
      return 0;
  }

  // OK success!

  p = finger.image2Tz();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return 0;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return 0;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return 0;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return 0;
    default:
      Serial.println("Unknown error");
      return 0;
  }

  // OK converted!
  p = finger.fingerSearch();
  if (p == FINGERPRINT_OK) {
    Serial.println("Found a print match!");
    dis.setCursor(0,1);
    dis.print("Finger found");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return 0;
  } else if (p == FINGERPRINT_NOTFOUND) {
    Serial.println("Did not find a match");
    dis.setCursor(0, 1);
  dis.print("unknown finger");
    delay(2000);
    return 0;
  } else {
    Serial.println("Unknown error");
    return 0;
  }

  // found a match!
  Serial.print("Found ID #"); Serial.print(finger.fingerID);
  Serial.print(" with confidence of "); Serial.println(finger.confidence);

  return finger.fingerID;
}

// returns -1 if failed, otherwise returns ID #
int getFingerprintIDez() {
  uint8_t p = finger.getImage();
  if (p != FINGERPRINT_OK)  return -1;

  p = finger.image2Tz();
  if (p != FINGERPRINT_OK)  return -1;

  p = finger.fingerFastSearch();
  if (p != FINGERPRINT_OK)  return -1;

  // found a match!
  Serial.print("Found ID #"); Serial.print(finger.fingerID);
  Serial.print(" with confidence of "); Serial.println(finger.confidence);
  return finger.fingerID;
}


bool testWifi(void){
  int c=0;
  Serial.println("Waiting for WIFI to connect");
  while(c<20){
    if(WiFi.status()==WL_CONNECTED){
      return true;
      
    }
    delay(500);
    Serial.print("*");
    c++;
  }
  Serial.println("");
  Serial.println("Connection Timed OUT openning HOTSPOT");
  return false;
}

void launchWeb(){
  Serial.println("");
  if(WiFi.status()==WL_CONNECTED)
    Serial.println("WiFi connected");
  Serial.print("Local IP");
  Serial.println(WiFi.localIP());
  createWebServer();
  server.begin();
  Serial.println("Server Started");
  
}



void setupAP(void){
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);
  int n=WiFi.scanNetworks();
  Serial.println("scan Complete");
  if(n==0){
    Serial.println("no WiFi Networks");
    
  }
  else{
    Serial.print(n);
    Serial.println("Networks Found");

    for (int i=0; i<n;++i){
      Serial.print(i+1);
      Serial.print(": ");
      Serial.print(WiFi.SSID(i));
      Serial.print(" (");
      Serial.print(WiFi.RSSI(i));
      Serial.print(")");
      Serial.println((WiFi.encryptionType(i)==ENC_TYPE_NONE)? " " : "*");
      delay(10);
    }
  }
  Serial.println("");
  st="<ol>";
  for(int i=0;i<n;++i){
    st+="<li>";
    st+=WiFi.SSID(i);
    st+=" (";
    st+=WiFi.RSSI(i);
    st+=")";
    st+=(WiFi.encryptionType(i)==ENC_TYPE_NONE)? "" : "*";
    st+="</li>";

  }
  st+="</ol>";
delay(100);
WiFi.softAP("ATTENDANCE","");
Serial.println("Initialising Access Point");
launchWeb();
Serial.println("over");
  }
  
void createWebServer(){
{
  server.on("/",[](){
    IPAddress ip= WiFi.softAPIP();
    String ipStr= String(ip[0])+'.'+String(ip[1])+'.'+String(ip[2])+'.'+String(ip[3]);
    content = "<!DOCTYPE HTML>\r\n<html><title>Registration</title>Users Registration Web <head>";
    
     content = "<style>.button {  background-color: #4CAF50; /* Green */ border: none;  color: white;  padding: 16px 32px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 16px;  margin: 4px 2px; transition-duration: 0.4s; cursor: pointer;}.button1 {  background-color: white;   color: black;  border: 2px solid #4CAF50;}.button1:hover {  background-color: #4CAF50;  color: white;} </style></head> <body>";
     
    content +="</p><form method='get' action='fingerprint'><p><label>Enrolment Id:</label><input name='reg' length=32></p><p><label>";
    
    content +="<p><p><input class='button button1' type='submit' align='center'>Scan Finger</input></form>";

    content +="</body></html>";
    server.send(200,"text/html",content);
    
  });
    
  server.on("/setting",[](){
     fname =server.arg("fname");
     lname = server.arg("lname");
     cart= server.arg("cart");


    if(fname.length()>0 && lname.length()>0){
    content +="<!DOCTYPE HTML>\r\n<html> <head>";
    content += "<style>.button {  background-color: #4CAF50; /* Green */ border: none;  color: white;  padding: 16px 32px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 16px;  margin: 4px 2px; transition-duration: 0.4s; cursor: pointer;}.button1 {  background-color: white;   color: black;  border: 2px solid #4CAF50;}.button1:hover {  background-color: #4CAF50;  color: white;} </style></head> <body>";
     content+="</p><p>Press the button and use the LCD to complete the remaining proceedures";
    content +="</p><form method='get' action='fingerprint'><p><input class='button button1' type='submit' align='center'></form>";
     content +="</html>";
     server.send(200,"text/html",content);

  }else{
    content = "{\"Error\":\404 not found\"}";
    statusCode=404;
    Serial.println("sending 404");
    
  }server.sendHeader("Access-Control-Allow-Origin","*");
  server.send(statusCode,"application/json",content);
  
});
//server.on("/change",[](){
//  now =server.arg("cartegory");
//
//  
//
//
//    if(now.length()>0){
//    content +="<!DOCTYPE HTML>\r\n<html> <head>";
//    content += "<style>.button {  background-color: #4CAF50; /* Green */ border: none;  color: white;  padding: 16px 32px;  text-align: center;  text-decoration: none;  display: inline-block;  font-size: 16px;  margin: 4px 2px; transition-duration: 0.4s; cursor: pointer;}.button1 {  background-color: white;   color: black;  border: 2px solid #4CAF50;}.button1:hover {  background-color: #4CAF50;  color: white;} </style></head> <body>";
//     content+="</p><p>Changes Accepted";
//   
//   content +="</html>";
//     server.send(200,"text/html",content);
//
//
// 
//     
//
//  }else{
//    content = "{\"Error\":\404 not found\"}";
//    statusCode=404;
//    Serial.println("sending 404");
//    
//  }server.sendHeader("Access-Control-Allow-Origin","*");
//  server.send(statusCode,"application/json",content);
//  
//});


  server.on("/fingerprint",[](){

  reg =server.arg("reg");
  Serial.println("Ready to enroll a fingerprint!");
  dis.setCursor(0,0);
 
  
  Serial.println("Please type in the ID # (from 1 to 127) you want to save this finger as...");
  id = reg.toInt();
  
  
  Serial.print("Enrolling ID #");
  Serial.println(reg);

  while (!  getFingerprintEnroll() );
  
    
    
    content ="<!DOCTYPE HTML>\r\n<html>";
    content +="Successifully registered";
    content +="</html>";
    server.send(200,"text/html",content);
    dis.setCursor(0,1);
    dis.print("Registered     ");
    delay(2000);
  dis.clear();
  });
  

}}
