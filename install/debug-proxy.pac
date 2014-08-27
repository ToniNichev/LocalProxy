// version 1

function FindProxyForURL(url, host)
  {


    if(shExpMatch(url, "*") ) {
     return "PROXY toni-develops.com:85";
    }

    return "DIRECT";
  }



