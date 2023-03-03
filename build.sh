#!/usr/bin/env bash
function echoRed() {
  echo "\033[31m ${1} \033[0m"
}

function echoGreen() {
  echo "\033[32m ${1} \033[0m"
}

function echoYellow() {
  echo "\033[33m ${1} \033[0m"
}

function echoPurple() {
  echo "\033[35m ${1} \033[0m"
}

function echoBule() {
  echo "\033[36m ${1} \033[0m"
}

#param1 file path
#param2 file name which matches upload app name will be removed
function cleanTomcatWebApp(){
  echoRed "start clean old apps in $(echoYellow \"${1}\") $(echoRed "with keywords") $(echoYellow \"${2}\") ..."
  for file in `ls ${1}`
    do
      filePath=${1}"/"$file
      result=$(echo ${file} | grep ${2})
      if [ "$result" != "" ]; then
        echoRed "we will delete the old file: "$filePath
        sudo rm -rf $filePath
      fi
    done
  echoRed "clean old apps success!!"
}

#read -p "do you need clean current project?:(input anything to refuse)" cleanProj
#read -p "service host:(default:root@106.15.138.237)             " host
#read -p "service tomcat path:(default: /usr/local/apache-tomcat-9.0.52)            " tomcatPath
read -p "input release env:(default:dev)             " releaseEnv
read -p "input release projectName[the tomcat webapp dir name]:(default ws_insight)             " releaseName

ssh_pem=/Users/neuifo/106.15.138.237.pem

#if [[ ${host} == "" ]]; then
  host=root@106.15.138.237
#fi

#if [[ ${tomcatPath} == "" ]]; then
  tomcatPath=/usr/local/tomcat4Eyecloud
#fi

localRootPath=$(cd $(dirname $0); pwd)

echoRed "...copy keycloak.json..."
jsonPath="/src/main/webapp/WEB-INF/"
devFile="keycloak-dev.json"
prodFile="keycloak-prod.json"
orgFile="keycloak.json"

if [[ ${releaseEnv} == "" ]]; then
    #cp "${localRDootPath}${jsonPath}${devFile}" "${localRootPath}${jsonPath}${orgFile}"
    releaseEnv='dev'
  else
    #cp "${localRootPath}${jsonPath}${prodFile}" "${localRootPath}${jsonPath}${orgFile}"
    host=root@101.133.152.236
    tomcatPath=/usr/local/tomcat4Eyecloud
    ssh_pem=/Users/neuifo/eyeque_prod.pem
fi

if [[ ${releaseName} == "" ]];then
  releaseName='insight_ws'
fi

#set the path which in your remote cloud service to upload war file
remotePath='/root'
#set your remote ssh root pwd
pwd=''

if [[ ${cleanProj} == "" ]]; then
  echoRed "...clean old maven files..."
  if ! mvn clean; then
      echoRed "clean file failed!!"
  fi
fi

echoRed "...building maven project..."

if ! mvn package; then
    echoRed "build failed!!"
fi

echoRed "...start uploading war file..."

warpath="/target"

fileDir="${localRootPath}${warpath}"

echoRed "${fileDir}"

files=$(ls $fileDir)
for file in $files
do
 filePath=$fileDir"/"$file
 if test -f $filePath
 then
    echoRed "find file:"$file
    result=$(echo ${file} | grep ".war")
    if [ "$result" != "" ]; then
      echoRed "find match war file:"$(echoYellow \"$file\")
      echoRed "we will rename war $(echoYellow \"$file\") to $(echoYellow \"$releaseName.war\") and uploading it to service"
      mv $filePath $fileDir"/"$releaseName.war
      echoRed "we will uploading $(echoYellow \"$releaseName.war\") to service..."
      rsync -r -v --progress $fileDir"/"$releaseName.war ${host}:/root
    fi
 fi
done


errorResult="command not found"
command=$(echo `sshpass`| grep "${errorResult}")
if [ "$command" != "" ]; then
  echoRed "please install sshpass before to use!!"
  echoRed "you can try"
  echoGreen "brew install esolitos/ipa/sshpass"
  exit 1
fi

sshpass ssh -i $ssh_pem ${host} <<eeooff

$(typeset -f echoRed)
$(typeset -f echoYellow)
$(typeset -f cleanTomcatWebApp)

cleanTomcatWebApp ${tomcatPath}/insight_ws ${releaseName}

cp $remotePath/$releaseName.war ${tomcatPath}/insight_ws

echoRed "copy $releaseName.war to tomcat success!!"

exit
remotessh
eeooff

echoRed "release ${releaseName} app COMPLETE!!!"