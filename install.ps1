$storageDir = split-path -parent $MyInvocation.MyCommand.Definition
$webclient = New-Object System.Net.WebClient
$url = "https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-1.9.7-windows.zip"
$file = "$storageDir\phantomjs.zip"
$webclient.DownloadFile($url,$file)

$url = "https://github.com/n1k0/casperjs/zipball/1.1-beta3"
$file = "$storageDir\casperjs.zip"
$webclient.DownloadFile($url,$file)

$shell = new-object -com shell.application
$zip = $shell.NameSpace("$storageDir\phantomjs.zip")
foreach($item in $zip.items())
{
$shell.Namespace("$storageDir").copyhere($item)
}

$zip = $shell.NameSpace("$storageDir\casperjs.zip")
foreach($item in $zip.items())
{
$shell.Namespace("$storageDir").copyhere($item)
}

$Paths = Get-ChildItem -Path $storageDir -Recurse
$casperPath = ""
foreach ($item in $Paths)
{
	if ($item.FullName.EndsWith("\bin\casperjs"))
	{
		$casperPath = $item.FullName
	}
}

$phantomPath = ""
foreach ($item in $Paths)
{
	if ($item.FullName.EndsWith("\phantomjs.exe"))
	{
		$phantomPath = $item.FullName
	}
}

echo $casperPath
$casperPathArray = $casperPath -split '\\'
$cLen = $casperPathArray.length - 2
$casperPath = $casperPathArray[0..$cLen] -join '\'

echo $phantomPath
$phantomPathArray = $phantomPath -split '\\'
$pLen = $phantomPathArray.length - 2
$phantomPath = $phantomPathArray[0..$pLen] -join '\'

Remove-Item "$storageDir\phantomjs.zip"
Remove-Item "$storageDir\casperjs.zip"

$env:Path += ";$phantomPath;$casperPath"
[Environment]::SetEnvironmentVariable("Path", $env:Path, [System.EnvironmentVariableTarget]::Machine)
