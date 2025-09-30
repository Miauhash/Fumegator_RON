// scripts/populateNfts.js (VERSÃO FINAL E COMPLETA)
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// O caminho para a pasta com os arquivos JSON
const METADATA_DIR = path.join(__dirname, '../public/img/nfts/json');

async function main() {
    console.log(`Lendo arquivos de metadados da pasta: ${METADATA_DIR}`);
    
    if (!fs.existsSync(METADATA_DIR)) {
        console.error("ERRO: O diretório de metadados não foi encontrado.");
        return;
    }

    const files = fs.readdirSync(METADATA_DIR).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
        console.error("ERRO: Nenhum arquivo .json encontrado.");
        return;
    }

    const nftData = [];

    for (const file of files) {
        const content = fs.readFileSync(path.join(METADATA_DIR, file), 'utf-8');
        const metadata = JSON.parse(content);
        const tokenId = parseInt(path.basename(file, '.json'));
        const rarityAttr = metadata.attributes.find(a => a.trait_type === 'Rarity');
        
        if (rarityAttr) {
            nftData.push({
                tokenId: tokenId,
                rarity: rarityAttr.value,
                // <<< AS NOVAS LINHAS IMPORTANTES ESTÃO AQUI >>>
                name: metadata.name, // Salva o nome do NFT
                image: metadata.image // Salva a URL da imagem do NFT
            });
        }
    }
    
    console.log(`Encontrados ${nftData.length} NFTs. Limpando a tabela antiga...`);
    await prisma.nft.deleteMany({}); // Limpa os dados antigos e incompletos
    
    console.log("Inserindo novos dados completos no banco de dados...");
    await prisma.nft.createMany({ data: nftData });
    
    console.log('Banco de dados populado com sucesso com todos os metadados!');
}

main().catch(e => console.error(e)).finally(async () => await prisma.$disconnect());