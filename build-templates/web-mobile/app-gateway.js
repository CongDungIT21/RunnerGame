var isFlutterInAppWebViewReady = false;//Gọi ngay khi bắt đầu game 
function initial(){ 
    //For app 
    window.addEventListener("flutterInAppWebViewPlatformReady", function(event) { 
        isFlutterInAppWebViewReady = true; 
        console.log("Flutter InAppWWWebView Platform Ready"); 
        console.log(isFlutterInAppWebViewReady); 
    }); 
} 

window.onload = function()
{
  console.error("Initial Application"); 
   initial();
}

window.callFromCocos = function(data)
{
  console.error("End Game")
  console.log(isFlutterInAppWebViewReady); 
  if (isFlutterInAppWebViewReady) { 
      console.log("KIDSEnglishAppFinishGame"); 
       window.flutter_inappwebview.callHandler('KIDSEnglishAppFinishGame', data); 
  }    //For web 
  window.parent.postMessage(data, "*"); 
}

window.onTapToNextButton = function()
{
  console.error("Next Lession")
    if (isFlutterInAppWebViewReady) { 
      console.log("KIDSEnglishAppNextItem"); 
      window.flutter_inappwebview.callHandler('KIDSEnglishAppNextItem', ""); 
  } 
}

