param(
    [string]$DatabaseUser = $(if ($env:MYSQL_USER) { $env:MYSQL_USER } else { 'root' })
)

$ErrorActionPreference = 'Stop'
if (-not $env:MYSQL_PASSWORD) {
    throw 'Set MYSQL_PASSWORD in this PowerShell session before running the seed.'
}

$backendPath = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$credentialsPath = Join-Path $backendPath 'seed-credentials.local'
$sourcePath = Join-Path $env:TEMP 'PlacePrepHashPassword.java'
$sqlPath = Join-Path $env:TEMP 'placeprep-seed-local.sql'

if (Test-Path -LiteralPath $credentialsPath) {
    $testPassword = (Get-Content -LiteralPath $credentialsPath -Raw).Trim()
} else {
    $bytes = [Security.Cryptography.RandomNumberGenerator]::GetBytes(18)
    $testPassword = 'PPtest-' + [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    Set-Content -LiteralPath $credentialsPath -Value $testPassword -NoNewline
}

$mavenRepo = Join-Path $env:USERPROFILE '.m2/repository/org/springframework'
$cryptoJar = Get-ChildItem (Join-Path $mavenRepo 'security/spring-security-crypto') -Recurse -Filter 'spring-security-crypto-*.jar' |
    Where-Object { $_.Name -notmatch '(sources|javadoc)' } |
    Sort-Object FullName -Descending | Select-Object -First 1
$jclJar = Get-ChildItem (Join-Path $mavenRepo 'spring-jcl') -Recurse -Filter 'spring-jcl-*.jar' |
    Where-Object { $_.Name -notmatch '(sources|javadoc)' } |
    Sort-Object FullName -Descending | Select-Object -First 1
if (-not $cryptoJar -or -not $jclJar) {
    throw 'Build the backend with Maven first so BCrypt dependencies are available locally.'
}

@'
import java.io.BufferedReader;
import java.io.InputStreamReader;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
class PlacePrepHashPassword {
  public static void main(String[] args) throws Exception {
    String password = new BufferedReader(new InputStreamReader(System.in)).readLine();
    System.out.println(new BCryptPasswordEncoder().encode(password));
  }
}
'@ | Set-Content -LiteralPath $sourcePath

try {
    $hash = $testPassword | java --class-path "$($cryptoJar.FullName);$($jclJar.FullName)" $sourcePath
    if ($LASTEXITCODE -ne 0 -or -not $hash.StartsWith('$2')) {
        throw 'BCrypt hash generation failed.'
    }
    $env:PLACEPREP_SEED_PASSWORD_HASH = $hash
    python (Join-Path $PSScriptRoot 'seed_local_mysql.py') | Set-Content -LiteralPath $sqlPath -Encoding utf8
    if ($LASTEXITCODE -ne 0) {
        throw 'Seed SQL generation failed.'
    }

    $env:MYSQL_PWD = $env:MYSQL_PASSWORD
    $server = mysql.exe --no-defaults --protocol=tcp --host=127.0.0.1 --port=3306 --user=$DatabaseUser --database=placeprep --batch --skip-column-names --execute='SELECT @@port, DATABASE()'
    if ($LASTEXITCODE -ne 0 -or $server -notmatch '3306\s+placeprep') {
        throw 'The database target is not local placeprep on port 3306.'
    }

    $mysqlPath = $sqlPath.Replace('\', '/')
    mysql.exe --no-defaults --protocol=tcp --host=127.0.0.1 --port=3306 --user=$DatabaseUser --database=placeprep --batch --skip-column-names --execute="source $mysqlPath"
    if ($LASTEXITCODE -ne 0) {
        throw 'MySQL rejected the seed. The insert transaction was not committed.'
    }
    Write-Output "Test password is stored in $credentialsPath (ignored by Git)."
} finally {
    Remove-Item Env:MYSQL_PWD -ErrorAction SilentlyContinue
    Remove-Item Env:PLACEPREP_SEED_PASSWORD_HASH -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $sourcePath, $sqlPath -ErrorAction SilentlyContinue
}
