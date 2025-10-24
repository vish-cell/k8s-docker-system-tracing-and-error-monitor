import React, {useState} from 'react';

/*
  Simple UI to generate a conceptual Kubernetes NetworkPolicy YAML snippet that
  blocks egress to a list of domains/IPs. In real deployments you'd convert
  domains to IPs and apply policies or use egress gateways.
*/
export default function C2PolicyGenerator(){
  const [items, setItems] = useState(['badc2.example','203.0.113.11']);
  const [policyName, setPolicyName] = useState('block-c2-egress');
  function addItem(){ setItems([...items, '']); }
  function updateItem(i, v){ const c = [...items]; c[i]=v; setItems(c); }
  function removeItem(i){ setItems(items.filter((_,j)=>j!==i)); }
  function generate(){
    // Note: NetworkPolicy egress works by IP/CIDR — this is conceptual.
    const yaml = `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ${policyName}
spec:
  podSelector: {}
  policyTypes:
  - Egress
  egress:
  - to:
${items.map(it=>`    - ipBlock:\n        cidr: ${it}`).join('\n')}
`;
    return yaml;
  }
  return (
    <div>
      <label>Policy name: <input value={policyName} onChange={e=>setPolicyName(e.target.value)} /></label>
      <h3>Block list (domains or IPs)</h3>
      {items.map((it,i)=>(
        <div key={i}>
          <input value={it} onChange={e=>updateItem(i,e.target.value)} />
          <button onClick={()=>removeItem(i)}>Remove</button>
        </div>
      ))}
      <button onClick={addItem}>Add</button>
      <h3>Generated YAML (conceptual)</h3>
      <pre style={{background:'#eee',padding:10,whiteSpace:'pre-wrap'}}>{generate()}</pre>
    </div>
  );
}
