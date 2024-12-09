pipeline {
    environment {
        backend = 'backend'  // Backend Docker image name
        frontend = 'frontend'  // Frontend Docker image name
    }

    agent any

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning the Git repository...'
                git branch: 'main', url: 'https://github.com/Aasmaan007/paytm-spe-.git'
            }
        }

        stage('Deploy with Ansible') {
            steps {
                echo 'Running Ansible playbook for deployment...'
                ansiblePlaybook(
                    playbook: 'Deployment/deploy.yml',
                    inventory: 'Deployment/inventory',
                    extras: '--vault-password-file /etc/ansible/vault_password.txt',
                    credentialsId: 'localhost',
                    disableHostKeyChecking: true
                )
            }
        }
    }
}
