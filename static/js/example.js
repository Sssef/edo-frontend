var SKS_PROVIDER_NAME = [
    "Смарт-ключ (RSA)",
    undefined,
    "Файл (RSA)",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "Смарт-ключ (ГОСТ)",
    undefined,
    undefined,
    "Файл (RSA) для IOS"
];

var htmlView = {
    clearInfo: function() {
        document.getElementById("new_signed_data").value = "";
    },

    selectKey: function(keyDir) {
        document.getElementById("key_path").innerHTML = keyDir;
    },

    setKeyDir: function(keyDir) {
        document.getElementById("key_path").innerHTML = keyDir;
    },

    fillCSPList: function(options) {
        var el = document.getElementById("CSPList");
        var id, i, j = 0;
        if (el != null) {
            for (i in options) {
                id = options[i].id;
                if (SKS_PROVIDER_NAME[id]) {
                    el.options[j] = new Option(SKS_PROVIDER_NAME[id], id);
                }
                j++;
            }
        }
    },

    setCurrentCSP: function(id) {
        document.getElementById("CSPList").value = id;
    },

    getSelectedCSP: function() {
        var list = document.getElementById("CSPList");
        return list[list.selectedIndex].value;
    },

    printResult: function(data){
        document.getElementById("new_signed_data").value = data;
    },

    getXML: function() {
        return "<get-auth-info document_type=\"a\"/>";
    },

    getXMLSign: function(){
        return document.getElementById("new_signed_data").value;
    },

    setErrorText: function(error) {
        //document.getElementById("err_label").innerHTML = error;
        alert(error);
    },

    switchCertInfoBlock: function(isTurnedOn) {
        var display = isTurnedOn ? "block" : "none";
        document.getElementById("certInfoBlock").style.display = display;
    },

    showCertInfo: function (certInfo) {
        document.all("cert_name").innerHTML="<font color='gray'>Имя сертификата:</font><br>"+certInfo.subjectDN+"<br><br>\n";
        document.all("issuer_name").innerHTML="<font color='gray'>Кем выдан:</font><br>"+certInfo.issuerDN+"<br><br>\n";
        document.all("date_from").innerHTML="<font color='gray'>Действителен с:<br></font>"+certInfo.dateFrom+"<br><br>\n";
        document.all("date_to").innerHTML="<font color='gray'>Действителен по:<br></font>"+certInfo.dateTo+"<br><br>\n";
        document.all("CFTCAStamp").innerHTML="<font color='gray'>CFTCAStamp:<br></font>"+certInfo.cftCAStamp+"<br><br>\n";
        document.all("serial").innerHTML="<font color='gray'>Серийный номер:<br></font>"+certInfo.serial+"<br><br>\n";
        document.all("signature_algorithm").innerHTML="<font color='gray'>Алгоритм подписи:<br></font>"+certInfo.signatureAlgorithm+"<br><br>\n";
        document.all("public_key").innerHTML="<font color='gray'>Публичный ключ:<br></font>"+certInfo.publicKey+"<br><br>\n";
        document.all("public_key_algorithm").innerHTML="<font color='gray'>Алгоритм ключа:<br></font>"+certInfo.publicKeyAlgorithm+"<br><br>\n";
        document.all("public_key_length").innerHTML="<font color='gray'>Размер ключа:<br></font>"+certInfo.publicKeyLength+"<br><br>\n";
        document.all("subject_key_id").innerHTML="<font color='gray'>Идентификатор владельца сертификата:<br></font>"+certInfo.subjectKeyId+"<br><br>\n";
        document.all("finger_print_algorithm").innerHTML="<font color='gray'>Алгоритм отпечатка:<br></font>"+certInfo.fingerPrintAlgorithm+"<br><br>\n";
        document.all("finger_print").innerHTML="<font color='gray'>Отпечаток:<br></font>"+certInfo.fingerPrint+"<br><br>\n";
        document.all("cert").innerHTML="<font color='gray'>Сертификат:<br></font>"+certInfo.cert+"<br>\n";
    }
};

window.onload = onLoad;
document.getElementById("CSPList").addEventListener("change", onChangeCSP, false);
document.getElementById("selectKeyButton").addEventListener("click", onChangeKeyDir, false);
document.getElementById("signButton").addEventListener("click", onXMLSign, false);
document.getElementById("verifyButton").addEventListener("click", onXMLVerify, false);
document.getElementById("getCertInfoButton").addEventListener("click", onGetCertInfo, false);

var sksj = new SKSJ();

function onLoad() {

    return sksj.getKeyDir()
        .then(function(keyDir) {
            htmlView.setKeyDir(keyDir);
            return sksj.getProviders();
        })
        .then(function(providers) {
            htmlView.fillCSPList(providers);
            // htmlView.fillCSPList({0: "Gem Plus RSA", 2: "Microsoft RSA", 4: "Crypto-PRO...", 8: "FTC GPK GOST...", 10: "UniCrypt"});
            return sksj.getCurrentProviderId();
        })
        .then(function(id) {
            htmlView.setCurrentCSP(id);
        })
        .catch(function(error) {
            htmlView.setErrorText("Error: " + JSON.stringify(error));
        });
}

function onXMLSign(){
    htmlView.clearInfo();
    sksj.importKey(1)
        .then(function(){
            return sksj.createSignature(htmlView.getXML())
        })
        .then(function(result) {
            htmlView.printResult(result);
        })
        .catch(function(error) {
            htmlView.setErrorText("Error: " + JSON.stringify(error));
        });
}

function onXMLVerify(){
    sksj.verifySignature(htmlView.getXMLSign())
        .catch(function(error) {
            htmlView.setErrorText("Error: " + JSON.stringify(error));
        });
}

function onChangeKeyDir(){
    htmlView.switchCertInfoBlock(false);
    sksj.changeKeyDir()
        .then(function(){
            return sksj.getKeyDir();
        })
        .then(function(result) {
            htmlView.selectKey(result);
        })
        .catch(function(error) {
            htmlView.setErrorText("Error: " + JSON.stringify(error));
        });
}

function onGetCertInfo(){
    sksj.importKey(1)
        .then(function () {
            return sksj.getCert(1);
        })
        .then(function (cert) {
            return sksj.getCertInfo(cert);
        })
        .then(function (certInfo) {
            htmlView.showCertInfo(certInfo);
            htmlView.switchCertInfoBlock(true);
        })
        .catch(function(error) {
            htmlView.setErrorText("Error: " + JSON.stringify(error));
        });
}

function onChangeCSP(){
    var id = htmlView.getSelectedCSP();
    sksj.setProvider(id)
        .catch(function(error) {
            htmlView.setErrorText("Error: " + JSON.stringify(error));
        });
}
