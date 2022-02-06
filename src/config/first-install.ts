import { exec, ExecException } from "child_process";
import { configStore } from "./store"

export const tryExecuteFirstInstallProcess = async () => {
  const config = await configStore.collection('config')
    .findOne({
      key: 'app'
    });

  // https://stackoverflow.com/questions/39369367/increase-max-allowed-packet-size-in-mysql-docker
  if (!config?.isDatabaseImportRun) {
    exec('mysql --defaults-extra-file=./db.ini -u tas -h 127.0.0.1 -P 3307 < ./import.sql ', { cwd: 'mysql/dumps' }, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(error);
        return;
      }
      if (stderr) {
        console.error(stderr);
        return;
      }

      console.log(stdout);
      configStore.collection('config').insertOne({
        key: 'app',
        isDatabaseImportRun: true
      });
    });
  }
}
